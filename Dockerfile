# Stage 1: Build Angular frontend
FROM node:20-alpine AS angular-build
WORKDIR /app
COPY TaskManager-FrontEnd/task-manager-ui/package*.json ./
RUN npm install
COPY TaskManager-FrontEnd/task-manager-ui/ .
RUN npm run build --prod

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /app
COPY TaskManager-BackEnd/*.csproj ./
RUN dotnet restore
COPY TaskManager-BackEnd/ .
RUN dotnet publish -c Release -o /app/out

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy backend
COPY --from=dotnet-build /app/out ./

# Copy Angular build to wwwroot
COPY --from=angular-build /app/dist/task-manager-ui/browser ./wwwroot

# Expose port
EXPOSE 80

# Set environment variable for database
ENV DefaultConnection="Host=ep-odd-feather-ag4lz7rz-pooler.c-2.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_oR9hqVwp7fTF;SSL Mode=Require;Trust Server Certificate=true"

# Run the backend
ENTRYPOINT ["dotnet", "TaskManager.dll"]
