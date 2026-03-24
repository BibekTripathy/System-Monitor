# System Monitor

A comprehensive system monitoring application built with Flask, providing real-time insights into system performance metrics and running processes.

## Features

- **Real-time Metrics**: Monitor CPU usage, memory consumption, and disk utilization
- **Process Management**: View and manage running system processes
- **RESTful API**: Clean API endpoints for easy integration
- **Cross-platform**: Works on Windows, macOS, and Linux

## Project Structure

```
System-Monitor/
├── backend/          # Flask backend API
│   ├── src/
│   │   ├── app.py
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── run.py
│   ├── requirements.txt
│   └── README.md
├── LICENSE
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd System-Monitor
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

6. Run the application:
   ```bash
   python run.py
   ```

The API will be available at `http://127.0.0.1:5000`

## API Endpoints

### Metrics
- `GET /api/metrics` - Retrieve system metrics (CPU, memory, disk)

### Processes
- `GET /api/processes` - List all running processes

## Development

For detailed setup instructions and development guidelines, see [backend/README.md](backend/README.md).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.