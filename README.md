# AuthTabsSync

AuthTabsSync is a Chrome extension designed to enhance your browsing experience by synchronizing actions across all tabs with the same hostname. Built with TypeScript and React, and utilizing the Mantine component library, AuthTabsSync automatically reloads or closes all other tabs with the same hostname whenever you log into a website, ensuring that your session is consistently updated across multiple tabs.

![AuthTabsSync Screenshot](./images/screenshot.png)
## Features

- **Automatic Tab Synchronization:** Detects login pages and synchronizes actions across all tabs with the same hostname.
- **Customizable Actions:** Choose to either reload or close tabs with the same hostname upon login detection.
- **Seamless Integration:** Works in the background without disrupting your browsing experience.
## Installation

There are two methods to install AuthTabsSync:

### Via Chrome Web Store

1. Visit the Chrome Web Store page.
2. Click on the "Add to Chrome" button to install the extension.

### Manual Installation (Clone the Repository)

1. Clone the repository to your local machine using Git:

```bash
git clone https://github.com/sgcooper78/AuthTabsSync.git
```

**Load the Extension:**

- Open Chrome and go to `chrome://extensions/`.
- Enable Developer mode (toggle switch in the top-right corner).
- Click on **Load unpacked** and select the directory where you cloned the repository.

**Test the Extension:**

- Open the extension.
- sign in or sign out and see the action happen.

## Usage

- **Enable Pasting:** Click the extension icon to activate the feature on the current page.
- **Toggle Settings:** Use the popup menu to turn pasting permissions on or off.
- **Feedback:** Share your experiences or report issues through our GitHub repository.

## Installation

1. Download the AuthTabsSync extension from the Chrome Web Store.
2. Click "Add to Chrome" to install the extension.
3. Once installed, the AuthTabsSync icon will appear in your Chrome toolbar.

## Building

1. Clone the repo
2. Run npm install
3. Run npm build
4. Load dist directory into chrome extension

## Settings

1. Click on the AuthTabsSync icon in your Chrome toolbar.
2. Choose your preferred action (reload or close tabs) for synchronization.

## Contributing

I welcome contributions from the community! If you’d like to contribute to the development of AuthTabsSync, please follow these steps:

1. **Fork the Repository:** Create a copy of the repository under your own GitHub account.
2. **Create a Branch:** Develop your changes in a separate branch.
3. **Submit a Pull Request:** Open a pull request with a description of your changes.

Please refer to our `CONTRIBUTING.md` file for more detailed guidelines.

## Support

If you find AuthTabsSync useful and would like to support its development, consider making a donation:

<a href="https://buymeacoffee.com/scottgcooper" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

Your contributions help ensure continued development and improvements to the extension.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please reach out to us at [sgcooper78@gmail.com](mailto:sgcooper78@gmail.com).
