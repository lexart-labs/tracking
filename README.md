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

### Steps to run in docker
- make sure that you have docker-compose in your machine or VM
- make sure that you have your `.env` is the same as your `.env-example` with the variables filled in
- run docker-compose up to run in your machine or `docker-compose up -d` in your VM

### Database maintenance
- if you have made changes to the database that should be applied in future installations create a file inside `db_init_scripts` 
- with the naming convention of `YYYY_MM_DD.sql` (EX: 2023_09_06.sql).
- you can run the files manually to update the database to the state you want.


### Initial Setup
- Backend port exposed at nginx configuration
- Create a .env at the same level of each .env.example with the same content and the right value of variables.


