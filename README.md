# Tracking

![Angular.js](https://img.shields.io/badge/angular.js-%23E23237.svg?style=for-the-badge&logo=angularjs&logoColor=white) ![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white) 

## About the software

Lextracking is a comprehensive platform that empowers individuals and teams to manage their work
efficiently and collaboratively. Designed as a centralized hub for productivity, it combines scheduling,
task tracking, project management, and CRM tools into a seamless experience. With the capacity to
adapt to various workflows and roles, it is an essential tool for modern professionals.

At its core, Lextracking offers a powerful scheduling system that simplifies the organization of fixed
and divided schedules, accommodating exceptions like absences or special events without disrupting
workflows. Users can effortlessly track tasks and progress, with integrations to popular tools like Trello
and Jira ensuring nothing gets overlooked.

The platform also includes a CRM menu, available exclusively to administrators, which facilitates the
registration and management of collaborators' bank accounts, payment tracking, and the
customization of financial details such as weekly hours, hourly rates, and currency settings.

A standout feature of Lextracking is its role-based access system. Five distinct roles—Admin,
Developer, Client, Architect, and Project Manager—determine the information and features available
to each user. Administrators have full access to all functionalities, while others enjoy tailored views
that focus on their specific responsibilities


The complete manual you could find in this link: https://bit.ly/49wkk4l

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (with Compose and Swarm support)
- [Make](https://www.gnu.org/software/make/)
- Bash shell

## Directory Structure

- `env_files/`: Contains environment variable files (`.env.local`, `.env.dev`, `.env.prod`)
- `deployment/`: Contains Docker Compose YAML files for each environment
- `services/`: Contains the main source code of the project, including the services, modules, and components that make up the application. Each subdirectory represents an independent service or a specific functionality.

## Setup

### Database maintenance
- if you have made changes to the database that should be applied in future installations create a file inside `db_init_scripts` 
- with the naming convention of `YYYY_MM_DD.sql` (EX: 2023_09_06.sql).
- you can run the files manually to update the database to the state you want.

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd project-name
   ```

2. **Prepare environment files:**
   - Copy and edit the example environment files in `env_files/` as needed:
     - `.env.local` for local development
     - `.env.dev` for development (Swarm)
     - `.env.prod` for production (Swarm)
   - Ensure each file sets `COMPOSE_PROJECT_NAME`.

3. **(OPTIONAL) Initialize Docker Swarm (for dev/prod):**
   ```sh
   docker swarm init
   ```

## Usage

All commands are run from the project root using `make`.

### Local Environment

- **Start local containers:**
  ```sh
  make local
  ```
- **Stop and remove local containers:**
  ```sh
  make clean-local
  ```

### Development Environment (Docker Swarm)

- **Deploy development stack:**
  ```sh
  make dev
  ```
- **Remove development stack:**
  ```sh
  make clean-dev
  ```

### Production Environment (Docker Swarm)

- **Deploy production stack:**
  ```sh
  make prod
  ```
- **Remove production stack:**
  ```sh
  make clean-prod
  ```

### General Clean

- **Clean local environment and get instructions for dev/prod:**
  ```sh
  make clean
  ```

### Help

- **Show available commands:**
  ```sh
  make help
  ```

## Troubleshooting

- Ensure your `.env.*` files exist and contain the `COMPOSE_PROJECT_NAME` variable.
- For Swarm commands, make sure Docker Swarm is initialized (`docker swarm init`).
- If a stack is not removed automatically, you can remove it manually:
  ```sh
  docker stack rm <your-stack-name>
  ```