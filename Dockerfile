# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package*.json ./

RUN npm ci

# Copy project source
COPY . .

# Do not run as root during normal execution
RUN chown -R pwuser:pwuser /app
USER pwuser

# Default environment
ENV CI=true \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Validate the TypeScript project during image build
RUN npx tsc --noEmit

# Default command
CMD ["npx", "playwright", "test"]