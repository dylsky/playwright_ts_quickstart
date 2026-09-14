# auto-playwright

Playwright-based automation framework with custom test hooks, Allure reporting and shared utility modules.

## Features

- Custom step hooks with per-step logging (Winston)
- Allure report integration (screenshots, artifacts)
- File parsing utilities (CSV, JSON)
- Configurable timeouts and waits via environment variables
- REST API client with request/response logging
- Fixture-based dependency injection for test pages

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm

```bash          
Installation                                                                                                                                                                                                                                                                                                  

npm ci                                                                                                                                                                                                                                                                                                             
npx playwright install chromium                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                   

Configuration                                                                                                                                                                                                                                                                                                      

Environment variables are loaded from .env:                                                                                                                                                                                                                                                                        

                                              
 Variable        Description          Default 
 ──────────────────────────────────────────── 
 GLOBAL_TIMEOUT  Global timeout (ms)  15000   
                                              

Running Tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
npx playwright test                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                   
Running Lint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
npm run lint                                                                                                                                                                                                                                                                                                       
                                                      