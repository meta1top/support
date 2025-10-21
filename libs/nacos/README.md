# @meta-1/nest-nacos

NestJS integration module for Nacos configuration management and service discovery.

## ✨ Features

- ⚙️ **Configuration Management** - Dynamic configuration loading and hot-reload
- 🔍 **Service Discovery** - Service registration and health check
- 🔄 **Auto Refresh** - Real-time configuration updates
- 🛡️ **Type Safety** - Full TypeScript support
- 📝 **YAML Support** - Parse and transform YAML configurations with camelCase conversion

## 📦 Installation

```bash
npm install @meta-1/nest-nacos
# or
pnpm add @meta-1/nest-nacos
# or
yarn add @meta-1/nest-nacos
```

### Peer Dependencies

```bash
npm install @nestjs/common @nestjs/config @meta-1/nest-common
```

## 🚀 Quick Start

### 1. Basic Setup

#### Register the Module

```typescript
import { Module } from '@nestjs/common';
import { NacosModule } from '@meta-1/nest-nacos';

@Module({
  imports: [
    NacosModule.forRoot({
      server: 'localhost:8848',
      namespace: 'public',
      username: 'nacos',
      password: 'nacos',
      config: {
        dataId: 'app-config',
        group: 'DEFAULT_GROUP',
      },
    }),
  ],
})
export class AppModule {}
```

#### Load Configuration at Bootstrap

```typescript
import { NestFactory } from '@nestjs/core';
import { loadNacosConfig } from '@meta-1/nest-nacos';
import { AppModule } from './app.module';

interface AppConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
  };
}

async function bootstrap() {
  // Load Nacos configuration before creating the app
  const nacosConfig = await loadNacosConfig<AppConfig>();
  
  // Create app with loaded configuration
  const app = await NestFactory.create(AppModule.forRoot(nacosConfig));
  
  await app.listen(3000);
}
bootstrap();
```

### 2. Configuration Management

#### Use Configuration in Services

```typescript
import { Injectable } from '@nestjs/common';
import { NacosConfigService } from '@meta-1/nest-nacos';

@Injectable()
export class DatabaseService {
  constructor(private readonly nacosConfig: NacosConfigService) {}

  async connect() {
    const config = this.nacosConfig.get<AppConfig>();
    
    // Use configuration
    console.log('Connecting to:', config.database.host);
  }
}
```

#### Subscribe to Configuration Changes

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NacosConfigService } from '@meta-1/nest-nacos';

@Injectable()
export class ConfigWatcher implements OnModuleInit {
  constructor(private readonly nacosConfig: NacosConfigService) {}

  onModuleInit() {
    // Subscribe to configuration changes
    this.nacosConfig.subscribe((content) => {
      console.log('Configuration updated:', content);
      // Handle configuration update
    });
  }
}
```

### 3. Service Discovery

#### Register Service

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NacosNamingService } from '@meta-1/nest-nacos';

@Injectable()
export class ServiceRegistry implements OnModuleInit {
  constructor(private readonly nacosNaming: NacosNamingService) {}

  async onModuleInit() {
    await this.nacosNaming.registerInstance({
      serviceName: 'user-service',
      ip: '192.168.1.100',
      port: 3000,
      metadata: {
        version: '1.0.0',
        env: 'production',
      },
    });
  }
}
```

#### Discover Services

```typescript
import { Injectable } from '@nestjs/common';
import { NacosNamingService } from '@meta-1/nest-nacos';

@Injectable()
export class ServiceDiscovery {
  constructor(private readonly nacosNaming: NacosNamingService) {}

  async findService() {
    // Get all instances of a service
    const instances = await this.nacosNaming.getAllInstances('user-service');
    
    // Select an instance (e.g., random selection)
    const instance = instances[Math.floor(Math.random() * instances.length)];
    
    return `http://${instance.ip}:${instance.port}`;
  }

  async selectHealthyInstance() {
    // Get a healthy instance
    const instance = await this.nacosNaming.selectInstance('user-service');
    
    return `http://${instance.ip}:${instance.port}`;
  }
}
```

#### Subscribe to Service Changes

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NacosNamingService } from '@meta-1/nest-nacos';

@Injectable()
export class ServiceWatcher implements OnModuleInit {
  constructor(private readonly nacosNaming: NacosNamingService) {}

  async onModuleInit() {
    // Subscribe to service instance changes
    await this.nacosNaming.subscribe('user-service', (instances) => {
      console.log('Service instances updated:', instances.length);
      // Update local service registry
    });
  }
}
```

## ⚙️ Configuration

### Module Options

```typescript
interface NacosModuleOptions {
  // Nacos server address (required)
  server: string;
  
  // Namespace (optional, default: 'public')
  namespace?: string;
  
  // Authentication (optional)
  username?: string;
  password?: string;
  
  // Configuration service options
  config: {
    // Configuration data ID (required)
    dataId: string;
    
    // Configuration group (optional, default: 'DEFAULT_GROUP')
    group?: string;
  };
  
  // Service naming options (optional)
  naming?: {
    // Service name
    serviceName: string;
    
    // Service group (optional, default: 'DEFAULT_GROUP')
    groupName?: string;
  };
}
```

### Environment Variables

You can use environment variables for configuration:

```typescript
NacosModule.forRoot({
  server: process.env.NACOS_SERVER || 'localhost:8848',
  namespace: process.env.NACOS_NAMESPACE || 'public',
  username: process.env.NACOS_USERNAME,
  password: process.env.NACOS_PASSWORD,
  config: {
    dataId: process.env.NACOS_DATA_ID || 'app-config',
    group: process.env.NACOS_GROUP || 'DEFAULT_GROUP',
  },
})
```

**.env file:**
```env
NACOS_SERVER=localhost:8848
NACOS_NAMESPACE=public
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
NACOS_DATA_ID=app-config
NACOS_GROUP=DEFAULT_GROUP
```

## 📝 YAML Configuration Format

The module supports YAML configuration with automatic camelCase conversion.

**Nacos YAML Configuration (kebab-case):**
```yaml
database:
  host: localhost
  port: 3306
  user-name: root      # Will be converted to userName
  password: password
  database-name: mydb  # Will be converted to databaseName

redis:
  host: localhost
  port: 6379
  max-retries: 3       # Will be converted to maxRetries

app-settings:          # Will be converted to appSettings
  enable-cache: true   # Will be converted to enableCache
  timeout-ms: 5000     # Will be converted to timeoutMs
```

**TypeScript Interface (camelCase):**
```typescript
interface AppConfig {
  database: {
    host: string;
    port: number;
    userName: string;      // Converted from user-name
    password: string;
    databaseName: string;  // Converted from database-name
  };
  redis: {
    host: string;
    port: number;
    maxRetries: number;    // Converted from max-retries
  };
  appSettings: {           // Converted from app-settings
    enableCache: boolean;  // Converted from enable-cache
    timeoutMs: number;     // Converted from timeout-ms
  };
}
```

## 📚 API Reference

### NacosConfigService

- `get<T>(): T | undefined` - Get current configuration
- `subscribe(listener)` - Subscribe to configuration changes

### NacosNamingService

- `registerInstance(options)` - Register a service instance
- `deregisterInstance(serviceName, ip, port)` - Deregister a service instance
- `getAllInstances(serviceName, groupName?, clusters?, subscribe?)` - Get all instances of a service
- `selectInstance(serviceName, groupName?, clusters?, subscribe?)` - Get a healthy instance (load-balanced)
- `subscribe(serviceName, listener)` - Subscribe to service changes
- `unsubscribe(serviceName, listener)` - Unsubscribe from service changes

### Utility Functions

- `loadNacosConfig<T>(): Promise<T>` - Load Nacos configuration at bootstrap
- `transformKeys(obj)` - Transform object keys from kebab-case to camelCase

## 🔍 Advanced Usage

### Dynamic Module with Factory

```typescript
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NacosModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        server: configService.get('NACOS_SERVER'),
        namespace: configService.get('NACOS_NAMESPACE'),
        username: configService.get('NACOS_USERNAME'),
        password: configService.get('NACOS_PASSWORD'),
        config: {
          dataId: configService.get('NACOS_DATA_ID'),
          group: configService.get('NACOS_GROUP'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Health Check with Service Discovery

```typescript
@Injectable()
export class HealthCheckService {
  constructor(private readonly nacosNaming: NacosNamingService) {}

  async checkServiceHealth(serviceName: string): Promise<boolean> {
    try {
      const instances = await this.nacosNaming.getAllInstances(serviceName);
      const healthyInstances = instances.filter(i => i.healthy);
      
      return healthyInstances.length > 0;
    } catch (error) {
      console.error(`Health check failed for ${serviceName}:`, error);
      return false;
    }
  }
}
```

## 🛠️ Troubleshooting

### Connection Issues

If you can't connect to Nacos:

1. Check if Nacos server is running: `curl http://localhost:8848/nacos/`
2. Verify server address in configuration
3. Check network connectivity and firewall rules
4. Verify username/password if authentication is enabled

### Configuration Not Loading

If configuration doesn't load:

1. Verify `dataId` and `group` are correct
2. Check if configuration exists in Nacos console
3. Verify namespace is correct
4. Check Nacos server logs for errors

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

