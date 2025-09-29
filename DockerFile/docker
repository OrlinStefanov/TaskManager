# -------------------------------
# Stage 1: Build Angular frontend
# -------------------------------
FROM node:20-alpine AS angular-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build --prod

# -------------------------------
# Stage 2: Build .NET backend
# -------------------------------
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS dotnet-build
WORKDIR /app
COPY backend/*.csproj ./
RUN dotnet restore
COPY backend/ .
RUN dotnet publish -c Release -o /app/out

# -------------------------------
# Stage 3: Combine and run
# -------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app

# Copy backend
COPY --from=dotnet-build /app/out ./

# Copy Angular build into wwwroot (served by backend)
COPY --from=angular-build /app/dist/task-manager-ui ./wwwroot

# Expose port
EXPOSE 80

# Environment variable for Neon PostgreSQL
ENV DefaultConnection="Host=ep-odd-feather-ag4lz7rz-pooler.c-2.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_oR9hqVwp7fTF;SSL Mode=Require;Trust Server Certificate=true"

# Run the backend
ENTRYPOINT ["dotnet", "TaskManager.dll"]
