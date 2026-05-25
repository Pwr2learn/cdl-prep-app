from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on('console', lambda msg: print(f'PAGE LOG: {msg.text}'))
    page.on('pageerror', lambda err: print(f'PAGE ERROR: {err}'))
    
    path = 'file:///' + os.path.abspath('index.html').replace('\\\\', '/')
    print(f'Loading {path}')
    page.goto(path)
    
    page.click("[onclick=\"openModeConfig('air')\"]")
    page.wait_for_timeout(100)
    
    page.click("[onclick=\"startConfiguredExam()\"]")
    page.wait_for_timeout(500)
    
    browser.close()
