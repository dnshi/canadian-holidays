# Canadian Holidays CLI

A simple Node.js command-line interface (CLI) tool to check the list of Canadian holidays for a given year.

## Features

- Retrieve and display a list of statutory holidays in Canada for a specified year.
- Specify the Canadian province to get holidays specific to that province.
- Display holidays in calendar format.

## Installation

Ensure you have Node.js installed on your machine. Install the tool globally using npm.

```bash
npm install -g canadian-holidays
```

## Usage

Run the CLI with the following command:

```bash
canadian-holidays [options]
```

Options:

- `-c, --calendar`: Display holidays in calendar format.
- `-p, --province <province>`: Specify the Canadian province to get holidays for that province.
- `-y, --year <year>`: Specify the year for which you want to check holidays.

Example:

```bash
canadian-holidays -y 2023 -p ON
```

This will display a list of statutory holidays in Ontario for the year 2023.

## API Source

The tool fetches holiday data from the [Canada Holidays API](https://canada-holidays.ca/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
