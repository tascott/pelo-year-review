<a id="readme-top"></a>


<!-- PROJECT LOGO -->
<br />
<div>
<h3>Peloton Year in Review</h3>

  <p>
    A web application that creates visualizations of your Peloton workout data, similar to Spotify Wrapped.
    <br />
    <a href="https://github.com/tascott/peloton-year-in-review">View Demo</a>
    ·
    <a href="https://github.com/tascott/peloton-year-in-review/issues">Report Bug</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This project allows Peloton users to visualize their workout data in an engaging, animated year-in-review format. Users can:
- View their total workouts, favorite instructors, and workout patterns
- See detailed cycling statistics and heart rate data
- Explore their workout music preferences
- View their activity calendar and streaks
- Try a demo version with sample data

### Built With

* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Supabase][Supabase]][Supabase-url]
* [![Framer Motion][Framer]][Framer-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

The data for the music slides is stored in a Supabase postgres database, with the data coming from thousands of api calls to the Peloton API. You could do this yourself with the peloton-node repo at https://github.com/tascott/peloton-node if you wanted to. You'll need to set up a Supabase project and add the credentials to the `.env` file.

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tascott/peloton-year-in-review.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Set up your Supabase project and add credentials to `.env`
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Change git remote url
   ```sh
   git remote set-url origin your_repository_url
   git remote -v # confirm the changes
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

The application provides both authenticated and demo experiences:
- Users can log in with their Peloton credentials to see their personal data
- A demo mode is available to showcase the features without requiring login
- NOTE: Usage is restricted to authorized emails to prevent database abuse. Contact me to get access.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Expand music data to include workouts other than cycling

See the [open issues](https://github.com/tascott/peloton-year-in-review/issues) for a list of proposed features (and known issues), if any.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Tom Scott - [@tascott](https://twitter.com/tascott) - contact@tascott.co.uk

Project Link: [https://github.com/tascott/peloton-year-in-review](https://github.com/tascott/peloton-year-in-review)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Framer]: https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white
[Framer-url]: https://www.framer.com/motion/
