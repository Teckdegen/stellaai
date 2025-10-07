# Use Node.js 18 alpine image
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@9.x

# Set pnpm to use the global installation
ENV PNPM_HOME=/usr/local/bin

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]