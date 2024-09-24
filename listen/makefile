# 定义 Docker 镜像名称和容器名称
IMAGE_NAME=myapp
CONTAINER_NAME=myapp_container

# 启动命令
start:
	@echo "Starting Docker container..."
	docker-compose up -d

# 停止命令
stop:
	@echo "Stopping Docker container..."
	docker-compose down

# 构建命令（可选）
build:
	@echo "Building Docker image..."
	docker-compose build

# 清理命令（可选）
clean:
	@echo "Cleaning up Docker images and containers..."
	docker-compose down --rmi all --volumes --remove-orphans