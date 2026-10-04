# Wellbeing Backend

The server of the [Wellbeing Android app](https://github.com/samirsuroshe18/WellBeing-App).
Users accept tasks built around good deeds and creative activity, post a photo
or a video as proof, and earn wellpoints from the likes their posts get. This
server keeps the accounts, tasks, posts, likes and comments, and works out the
points and the leaderboard.

**Live server:** `https://wellbeing-backend-5f8e.onrender.com/api/v1`. It runs on
a free plan, so the first request after a quiet spell can take up to a minute.

## What it does

- **Accounts**: sign up with a profile picture, a verification link by email,
  login, logout, password reset by email, and editing the name and picture.
- **Tasks**: any user can create a task with an image or a video and a time
  limit in days. A user is offered a random task they have not taken yet, and
  accepts it.
- **Proof**: a post with a photo or a video completes the accepted task. A task
  whose time runs out without proof is marked incompleted.
- **Feed**: posts with their likes, dislikes and comments. A user can like or
  dislike a post, not both; tapping again takes it back.
- **Wellpoints and leaderboard**: a post earns one point for every like and
  loses half a point for every dislike. Users are ranked by their total.

## Tech stack

| Part | Stack |
|---|---|
| Server | Node.js, Express |
| Database | MongoDB with Mongoose |
| Login | JSON Web Tokens, bcrypt |
| Files | Multer, Cloudinary |
| Email | Brevo HTTPS API, or SMTP through Nodemailer |
| Pages in emails | EJS |

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB connection string (local MongoDB or MongoDB Atlas)
- A Cloudinary account, for pictures and videos
- A Brevo API key or SMTP credentials, for the verification and reset emails

### Setup

```bash
git clone https://github.com/samirsuroshe18/wellbeing-backend.git
cd wellbeing-backend
npm install
cp .env.example .env     # then fill in the values, see below
```

### Settings

`.env`:

| Key | Purpose |
|---|---|
| `PORT`, `SERVER_HOST` | Where the server listens. Defaults: `8000` and `0.0.0.0`. A host such as Render sets `PORT` itself |
| `MONGODB_URI` | Database connection string |
| `CORS_ORIGIN` | Origin allowed to call the server from a browser; `*` for any |
| `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY` | A long random text that logins are signed with, and how long a login lasts, for example `1d` |
| `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY` | The same for the refresh token, for example `10d` |
| `DOMAIN_NAME` | The public address of this server, without a slash at the end. The links in emails are built from it |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Where pictures and videos are stored |
| `BREVO_API_KEY`, `MAIL_FROM` | Send email through the Brevo HTTPS API. `MAIL_FROM` must be a sender verified in Brevo |
| `MAIL_HOST`, `EMAIL_PORT`, `MAIL_USER`, `MAIL_PASS` | SMTP settings, used when `BREVO_API_KEY` is empty |

### Run

```bash
npm run dev      # restarts on changes
npm start        # as on a host
```

The server answers under `http://localhost:8000/api/v1` (or the `PORT` you set).

To use it from the app, set `BASE_URL` in the app's `ApiClient.java` to an
address the phone can reach. Android only allows `https` by default, so a
tunnel with an `https` address is the simplest way to reach a server on your
own machine.

## API

Every route is under `/api/v1`. A request with a login sends
`Authorization: Bearer <accessToken>`; the token comes from `/users/login`.

Answers have the shape `{ status, data, message, success }`. An error answers
`{ status, message }` with the matching HTTP status.

### Accounts

| Route | Login | Purpose |
|---|---|---|
| `POST /users/register` | no | Sign up. Form fields `userName`, `email`, `password` and the file `profilePicture`. Sends the verification email |
| `POST /users/login` | no | `{ email, password }`. Answers the user and the tokens |
| `POST /users/forgot` | no | `{ email }`. Sends the reset email |
| `GET /users/logout` | yes | Ends the session |
| `GET /users/get-userinfo` | yes | The profile with wellpoints, rank, completed tasks and success rate |
| `POST /users/update-account` | yes | Form field `userName` and, optionally, the file `profilePicture` |
| `GET /users/get-leaderboardlist` | no | Every user with their wellpoints, highest first |

### Links from emails

| Route | Purpose |
|---|---|
| `GET /verify/verify-email?token=` | Verifies the address and shows a page |
| `GET /verify/reset-password?token=` | Shows the page for a new password |
| `POST /verify/verify-password?token=` | `{ password, confirmPassword }`. Sets the new password |

### Tasks

| Route | Purpose |
|---|---|
| `POST /tasklist/create-task` | Form fields `title`, `description`, `timeToComplete` (days, at least 1), `mediaType` (`image` or `video`) and the file `taskReference` |
| `GET /usertaskinfo/get-task` | A random task the user has not taken yet; an empty list when none is left |
| `POST /usertaskinfo/accept-task` | `{ taskInfo }`, the id of the task. Answers the id of the accepted task and the time left |
| `POST /usertaskinfo/get-status` | `{ _id }`, the id of the accepted task. Answers `pending`, `completed` or `incompleted` with the task and the time left |
| `POST /usertaskinfo/view-task` | `{ id }`, the id of a task. Answers the task |

All of them need a login.

### Posts, likes and comments

| Route | Purpose |
|---|---|
| `POST /upload/upload-post` | Form fields `task`, `description`, `mediaType` and the file `multiMedia`. The proof for a task |
| `GET /upload/get-post` | The feed, newest first |
| `GET /upload/get-points` | The user's wellpoints |
| `POST /like/send-like` | `{ multiMedia }`, the id of a post. Likes it, or takes the like back |
| `POST /dislike/send-dislike` | `{ multiMedia }`. Dislikes it, or takes the dislike back |
| `POST /comment/post-comment` | `{ multiMedia, content }` |
| `POST /comment/get-comment` | `{ multiMedia }`. The comments of a post |

All of them need a login. An uploaded file can be up to 100 MB.

## Deployment

Any Node.js host works. On Render: a Web Service from this repository with the
build command `npm install` and the start command `npm start`, and the settings
above as environment variables. Set `DOMAIN_NAME` to the address Render gives
the service, and use `BREVO_API_KEY` for email, since hosts often block the
SMTP ports.

## Project structure

```
src/
  app.js, index.js   Express app and start-up
  controllers/       Accounts, verification, tasks, posts, likes, comments
  db/                Database connection
  middleware/        Login check, file uploads
  models/            User, TaskCollection, UserTaskInfo, Upload, Like, Dislike, Comment
  routes/
  utils/             Cloudinary, email, errors and answers
  views/             Pages shown from the links in emails
public/temp/         Uploaded files on their way to Cloudinary
```

## License

[MIT](LICENSE)
