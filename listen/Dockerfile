# 使用官方 Node.js 镜像作为基础镜像
FROM node:14 AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用程序代码
COPY . .

# 构建应用程序（如果需要）
RUN npm run build

# 使用官方 Nginx 镜像作为基础镜像
FROM nginx:alpine

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建的应用程序代码到 Nginx 目录
COPY --from=build /app/build /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]