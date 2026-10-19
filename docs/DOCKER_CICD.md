# DevLinker — Dockerization and CI/CD Pipeline

## 1. Project Overview

DevLinker is a web application that I Dockerized and deployed on AWS EC2 using GitHub Actions and Docker Hub.

### Technologies Used

- **Docker:** Containerization of frontend and backend.
- **Docker Compose:** Running and managing containers together.
- **Docker Hub:** Storing Docker images.
- **GitHub Actions:** Automating CI/CD.
- **AWS EC2:** Hosting the application.
- **AWS IAM OIDC:** Providing temporary AWS credentials securely.
- **SSH:** Connecting to EC2 to deploy the application.

### Deployment Flow

```text
Developer
   |
   | git push to main
   v
GitHub Actions (CI)
   |
   | Build Docker images
   | Push images
   v
Docker Hub
   |
   v
GitHub Actions (CD)
   |
   | SSH into EC2
   | Pull latest images
   | Restart containers
   v
AWS EC2 — Live Application
```

## 2. Dockerization of DevLinker

Dockerization means packaging an application and its dependencies into Docker images so it can run consistently across different environments.

### Backend Dockerfile

A typical Node.js backend Dockerfile:

```dockerfile
FROM node:22

WORKDIR /app

COPY . .

RUN npm install

RUN npx tsc -b

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

- `FROM`: Selects the base image.
- `WORKDIR`: Sets the working directory inside the container.
- `COPY`: Copies project files into the image.
- `RUN`: Installs dependencies and compiles TypeScript.
- `EXPOSE`: Documents the application's listening port.
- `CMD`: Starts the backend application.

*Note: The Dockerfile above is an illustrative example; retain the exact Dockerfile from your working DevLinker repository.*

### Frontend Dockerfile

The frontend has its own Dockerfile and image. Its exact build commands depend on the frontend framework and project configuration.

```dockerfile
# Stage 1: Build the React frontend
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the production build
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Why two stages?
- Builder stage: Installs dependencies and creates the production frontend build in dist.
- Nginx stage: Serves the generated static files without including Node.js and the build dependencies in the final image.
Keeping separate images allows the frontend and backend to be built and updated independently.

### Docker Compose

Docker Compose defines and manages multiple containers using a YAML configuration file, usually `compose.yaml` or `docker-compose.yml`.

On EC2, we use Docker Compose to run the frontend and backend together.

```bash
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
```

- `pull`: Downloads the latest images referenced in the Compose configuration.
- `up -d`: Creates or recreates containers when necessary and runs them in the background.
- `ps`: Displays the status of Compose containers.

We use Docker Compose because it simplifies the management of multiple services.

## 3. CI — Continuous Integration

### What is CI?

Continuous Integration means automatically building and checking application changes whenever developers push code.

In our project, GitHub Actions builds Docker images and pushes them to Docker Hub whenever code is pushed to the `main` branch.

### GitHub Actions Workflow

The workflow is stored inside:

```text
.github/workflows/deploy.yml
```

### CI Workflow Code

The following is the CI portion of the pipeline, using the DevLinker image names.

```yaml
name: DevLinker CI/CD

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v6
        with:
          context: ./server
          push: true
          tags: 03asad/devlinker-backend:v1

      - name: Build and push frontend
        uses: docker/build-push-action@v6
        with:
          context: ./client
          push: true
          tags: 03asad/devlinker-frontend:v1
```

**Important:** This is the CI portion, not the complete final workflow. Adjust `./server` and `./client` if your repository uses different directory names. The final workflow also contains a separate deployment job.

### Explanation

- `on: push`: Triggers the workflow when code is pushed.
- `branches: main`: Runs the workflow for pushes to `main`.
- `runs-on: ubuntu-latest`: Uses a GitHub-hosted Ubuntu runner.
- `actions/checkout`: Downloads the repository code onto the runner.
- `docker/login-action`: Authenticates with Docker Hub.
- `docker/build-push-action`: Builds and pushes the images.

The credentials are stored in GitHub repository secrets rather than written directly in the workflow.

### Why Did We Use Docker Hub?

Docker Hub acts as a central image registry. The CI job pushes the built images there, and EC2 pulls those images during deployment.

This avoids manually copying application files to EC2 for every code change.

## 4. CD — Continuous Deployment: Method 1

### What is CD?

Continuous Deployment automatically releases code changes to the deployment environment after the required pipeline steps succeed.

In our first approach, we used SSH to connect to EC2 and run Docker Compose commands.

### Basic Deployment Job

This is the basic CD approach, before adding the temporary SSH firewall rule.

```yaml
  deploy-to-ec2:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy application
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/devlinker-deploy
            sudo docker compose pull
            sudo docker compose up -d
            sudo docker compose ps
```

The indentation is important: `deploy-to-ec2` must be another job under `jobs`, at the same level as `build-and-push`.

### How It Works

1. `needs: build-and-push` ensures CI finishes successfully before deployment begins.
2. The SSH action connects to EC2 using its host, username and private key.
3. It navigates to the deployment directory.
4. Docker Compose pulls the images from Docker Hub.
5. Docker Compose updates and starts the containers.
6. The final command checks their status.

The directory `~/devlinker-deploy` must already contain the deployment Compose configuration.

### Why Did We Use SSH?

SSH lets us execute commands remotely on the EC2 instance. We can therefore automate deployment without logging in manually each time.

### The Problem We Faced

Our EC2 Security Group initially allowed SSH connections only from our local public IP.

However, the SSH connection was initiated by a **GitHub-hosted runner**, not our laptop. Its public IP was different, so EC2 blocked the connection and the deployment failed with an SSH timeout.

The basic deployment job was valid, but the network configuration prevented the runner from connecting.

## 5. CD — Method 2: SSH with Temporary Security Group Access

To solve the problem without permanently opening SSH to the internet, we expanded the deployment job.

The improved workflow:

1. Authenticates with AWS through OIDC.
2. Retrieves the GitHub runner's public IP.
3. Temporarily permits that IP on TCP port 22.
4. Deploys through the same SSH action.
5. Removes the temporary rule, even if deployment fails.

### Required GitHub Secrets

| Secret                  | Purpose                       |
| ----------------------- | ----------------------------- |
| `DOCKERHUB_USERNAME`    | Docker Hub username           |
| `DOCKERHUB_TOKEN`       | Docker Hub access token       |
| `EC2_HOST`              | EC2 public IP or DNS          |
| `EC2_SSH_KEY`           | EC2 SSH private key           |
| `AWS_DEPLOY_ROLE_ARN`   | IAM role ARN for OIDC         |
| `EC2_SECURITY_GROUP_ID` | Security Group ID used by EC2 |

The AWS region is configured as `ap-southeast-2`.

### Improved Deployment Job

This job replaces the basic `deploy-to-ec2` job. Keep the `build-and-push` job unchanged.

```yaml
  deploy-to-ec2:
    needs: build-and-push
    runs-on: ubuntu-latest

    permissions:
      id-token: write
      contents: read

    steps:
      - name: Configure AWS credentials using OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ap-southeast-2

      - name: Get runner public IP
        id: ip
        uses: haythem/public-ip@v1.3

      - name: Allow temporary SSH access
        id: allow-ssh
        run: |
          RULE_ID=$(aws ec2 authorize-security-group-ingress \
            --group-id "${{ secrets.EC2_SECURITY_GROUP_ID }}" \
            --protocol tcp \
            --port 22 \
            --cidr "${{ steps.ip.outputs.ipv4 }}/32" \
            --query 'SecurityGroupRules[0].SecurityGroupRuleId' \
            --output text)

          echo "rule_id=$RULE_ID" >> "$GITHUB_OUTPUT"

      - name: Deploy application
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/devlinker-deploy
            sudo docker compose pull
            sudo docker compose up -d
            sudo docker compose ps

      - name: Remove temporary SSH access
        if: always() && steps.allow-ssh.outputs.rule_id != ''
        run: |
          aws ec2 revoke-security-group-ingress \
            --group-id "${{ secrets.EC2_SECURITY_GROUP_ID }}" \
            --security-group-rule-ids "${{ steps.allow-ssh.outputs.rule_id }}"
```

**Note:** This is the deployment-job structure discussed, with explicit cleanup. Verify that the selected public-IP action's output matches `steps.ip.outputs.ipv4`, and test the cleanup step in your workflow. The AWS role must have permission to authorize and revoke ingress rules on the intended Security Group.

### Why `/32`?

An IPv4 CIDR ending in `/32` represents one specific IP address.

For example:

```text
203.0.113.10/32
```

This permits the specified address rather than an entire range of IP addresses.

The example IP above is illustrative, not your runner's actual IP.

### Why Did We Add `if: always()`?

Normally, GitHub Actions skips subsequent steps when an earlier step fails.

`if: always()` allows the cleanup step to run even when the SSH deployment step fails. This helps prevent temporary firewall rules from being left behind.

It is still important to monitor cleanup failures and remove any leftover temporary rule if necessary.

## 6. Difference Between Both CD Methods

Both approaches use SSH for deployment. The difference is how access to EC2 is handled.

| Feature                  | Method 1                      | Method 2                             |
| ------------------------ | ----------------------------- | ------------------------------------ |
| AWS OIDC                 | Not needed for SSH alone      | Used to authorize AWS API calls      |
| SSH action               | Yes                           | Yes                                  |
| Temporary runner IP rule | No                            | Yes                                  |
| Automatic cleanup        | No temporary rule to clean up | Revokes the temporary rule           |
| Main limitation          | Requires existing SSH access  | Requires correct AWS IAM permissions |

### Why Did We Choose Method 2?

Our runner's SSH connection was timing out because the Security Group allowed our local IP but not the runner's IP.

Method 2 solved this by adding the runner's current IP temporarily, deploying through SSH, and removing the rule afterward.

It also kept the existing `build-and-push` job unchanged.

**Important interview point:** OIDC and temporary IP allowlisting are not required for every CI/CD pipeline. We added them to solve our specific AWS authentication and SSH network-access requirements.

## 7. AWS OIDC — Important Topic

### What is OIDC?

OIDC stands for OpenID Connect. In GitHub Actions, it lets a workflow obtain an identity token that AWS can validate before granting access through an IAM role.

### Why Did We Use AWS OIDC?

We used OIDC to let GitHub Actions call AWS APIs to modify the EC2 Security Group without storing long-lived AWS access keys in GitHub Secrets.

### How Does It Work?

1. GitHub Actions requests an OIDC identity token.
2. AWS validates the token against the configured identity provider and IAM role trust policy.
3. If the token satisfies the trust policy, AWS STS issues temporary credentials.
4. The workflow uses those credentials to authorize and revoke the temporary SSH rule.

### What is an IAM Role?

An IAM role defines the permissions that an authorized identity can use.

Our deployment role needs narrowly scoped permissions for the required Security Group operations. It should not have unrestricted administrator access.

### Why Is OIDC Better Than Long-Lived Access Keys?

- No long-lived AWS access key needs to be stored in GitHub Secrets.
- AWS credentials are temporary.
- The trust policy can restrict which repository and branch may assume the role.
- Access can be limited to the specific AWS actions needed for deployment.

Our workflow uses:

```yaml
permissions:
  id-token: write
  contents: read
```

`id-token: write` allows the workflow to request the OIDC token. It does not itself grant AWS permissions; the IAM role and its trust policy determine access.

The trust policy must match the workflow's actual repository and branch identity. In our setup, we restricted the trusted subject to the `main` branch.

## 8. GitHub Runner IP vs Local IP

### What is a GitHub-Hosted Runner?

A GitHub-hosted runner is a temporary virtual machine provided by GitHub to execute workflow jobs.

It is separate from our local laptop.

### Why Was the IP Different?

When we connect manually, EC2 sees our local network's public IP. When GitHub Actions runs the SSH step, EC2 sees the runner's public IP.

These IPs are different because the connections originate from different machines and networks.

### Why Did SSH Time Out?

Our EC2 Security Group allowed SSH on port 22 from our local public IP only. The runner's connection did not match that rule, so the connection timed out.

### How Did We Solve It?

- Retrieved the runner's public IP during the workflow.
- Added a temporary TCP port 22 rule for that IP using `/32`.
- Connected through the SSH action.
- Revoked the specific temporary rule after the deployment step.

We retained the existing Security Group rules instead of replacing them.

This follows the principle of least privilege: grant only the access required, for only as long as it is needed.

## 9. Automatic Deployment Test

We verified the pipeline using a small code change.

### Steps

1. Make a small change to the DevLinker code.
2. Commit and push the change to `main`.
3. Open the GitHub repository's Actions tab.
4. Confirm the `build-and-push` job builds and pushes the images.
5. Confirm `deploy-to-ec2` runs after CI succeeds.
6. Verify that the runner's temporary SSH access is configured and cleaned up.
7. Check that EC2 pulls the images and starts the containers.
8. Open the application through its EC2 Elastic IP or configured address.

### Commands Used on EC2

```bash
cd ~/devlinker-deploy
sudo docker compose ps
sudo docker compose logs
```

The first command shows container status; the second helps inspect application logs when troubleshooting.

The test confirms that pushing code to `main` can trigger the automated build, image push, and deployment flow without manually redeploying the application.

## 10. Complete CI/CD Workflow — End to End

The final pipeline consists of two jobs.

### Job 1: `build-and-push`

- Runs on a GitHub-hosted runner.
- Checks out the repository.
- Logs in to Docker Hub.
- Builds the backend and frontend images.
- Pushes the images to Docker Hub.

### Job 2: `deploy-to-ec2`

- Waits for `build-and-push` to succeed.
- Obtains temporary AWS credentials through OIDC.
- Retrieves the runner's public IP.
- Temporarily allows SSH access through the EC2 Security Group.
- Connects to EC2 using `appleboy/ssh-action@v1`.
- Pulls the latest images and restarts containers.
- Removes the temporary SSH rule.

### Why Do We Use `needs: build-and-push`?

It ensures deployment does not start before the image-building and pushing job has completed successfully.

### Why Do We Pull Before Restarting?

The image must be downloaded to EC2 before the Compose deployment can use it. `docker compose up -d` then recreates services when their configured images have changed.

For reliable production versioning, immutable image tags or commit-specific tags are preferable to relying exclusively on a fixed `v1` tag.

## 11. Challenges Faced and Solutions

### Challenge 1: SSH Connection Timeout

**Problem:** The GitHub-hosted runner could not connect to EC2 because its public IP was not allowed by the Security Group.

**Solution:** Added a temporary SSH ingress rule for the runner's IP and revoked it after deployment.

### Challenge 2: Runner IP Different From Local IP

**Problem:** The local laptop and GitHub runner use different public network addresses.

**Solution:** Retrieved the runner's public IP dynamically instead of assuming it matched the local IP.

### Challenge 3: Secure AWS Authentication

**Problem:** The workflow needed permission to modify the Security Group without relying on permanent AWS access keys.

**Solution:** Configured AWS OIDC, an IAM role, a trust policy, and temporary credentials.

### Challenge 4: Automating Deployment

**Problem:** Manually pulling images and restarting containers after every code change would be repetitive.

**Solution:** Used GitHub Actions to automate image building, pushing, and deployment.

### Challenge 5: Verifying the Deployment

**Problem:** A successful image build does not necessarily mean the application is running correctly on EC2.

**Solution:** Checked the GitHub Actions job results, Compose container status, application logs, and the deployed application itself.

## 12. DevOps Interview Questions and Answers

### Q1. Explain your DevLinker CI/CD pipeline.

I Dockerized the frontend and backend, then created a GitHub Actions pipeline. Whenever I push code to `main`, GitHub Actions builds the Docker images and pushes them to Docker Hub. After that, the deployment job connects to EC2 through SSH, pulls the latest images, and restarts the containers using Docker Compose.

### Q2. What challenges did you face in CI/CD?

The main challenge was an SSH connection timeout. EC2 allowed SSH only from my local public IP, but GitHub Actions used a different runner IP. I solved this by temporarily allowing the runner's IP in the Security Group and removing that rule after deployment. I also configured AWS OIDC for secure AWS authentication.

### Q3. What is AWS OIDC, and why did you use it?

OIDC allows GitHub Actions to authenticate with AWS using a trusted identity token. I used it to obtain temporary AWS credentials through an IAM role instead of storing long-lived AWS access keys in GitHub Secrets.

### Q4. Why was the GitHub runner's IP different from your local IP?

Because the GitHub-hosted runner and my laptop are different machines on different networks. The runner makes its own outbound connection, so EC2 sees the runner's public IP rather than my laptop's public IP.

### Q5. Why did SSH initially fail?

The EC2 Security Group allowed port 22 only from my local IP. Since the GitHub runner's IP was not allowed, its SSH connection timed out.

### Q6. Why did you use Docker Compose on EC2?

Docker Compose lets me manage the frontend and backend containers together using one configuration file. I can pull images, start or recreate services, and check container status using simple commands.

### Q7. What happens when you push code to `main`?

GitHub Actions triggers the workflow. It builds and pushes the frontend and backend images to Docker Hub. Once CI succeeds, the deployment job configures temporary AWS access, connects to EC2 through SSH, pulls the images, and updates the running containers.

### Q8. Why use temporary AWS credentials?

They reduce the need to store long-lived AWS credentials and limit how long the workflow's AWS access remains valid. The IAM role still needs a properly restricted trust policy and permissions.

### Q9. Why use `docker compose pull` and `docker compose up -d`?

`docker compose pull` downloads the images specified in the Compose configuration. `docker compose up -d` starts the services and recreates containers when necessary to use changed images, without attaching the terminal to their output.

### Q10. What happens if the pipeline fails?

If the CI job fails, the deployment job does not run because it depends on CI through `needs: build-and-push`. If deployment fails after the temporary SSH rule is created, the cleanup step attempts to revoke that rule. I would inspect the GitHub Actions logs to identify and fix the failure.

### Q11. Why not permanently allow SSH from anywhere?

Allowing SSH from `0.0.0.0/0` exposes the SSH port to the entire IPv4 internet. We instead temporarily allowed the specific runner IP and removed the rule after deployment.

### Q12. What is the difference between CI and CD?

CI automatically builds and validates code changes. CD takes the successfully built application and deploys it to the target environment. In DevLinker, CI builds and pushes Docker images, while CD deploys those images to EC2.

---

## Final Summary

My DevLinker project demonstrates a complete automated deployment workflow:

- Dockerized frontend and backend.
- Docker Compose for running containers.
- GitHub Actions for CI/CD automation.
- Docker Hub for storing images.
- AWS EC2 for hosting the application.
- AWS OIDC for secure, temporary AWS credentials.
- Temporary Security Group access to resolve the GitHub runner IP issue.
- SSH-based deployment and cleanup.

The main challenge was understanding that the GitHub-hosted runner connects from its own public IP, not my local IP. Solving that issue helped me understand AWS Security Groups, OIDC, IAM roles, and secure CI/CD deployment more practically.
