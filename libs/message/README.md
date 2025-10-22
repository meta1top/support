# @meta-1/nest-message

Message service library for NestJS applications including email sending, verification code management, and more.

## ✨ Features

- 📧 **Email Service** - Support for AWS SES and Aliyun DirectMail
- 🔐 **Verification Code** - Redis-based verification code management
- 🎯 **Error Codes** - Type-safe error code definitions

## 📦 Installation

```bash
npm install @meta-1/nest-message
# or
pnpm add @meta-1/nest-message
# or
yarn add @meta-1/nest-message
```

## 🚀 Usage

### Email Service

```typescript
import { MailService } from '@meta-1/nest-message';

@Injectable()
export class UserService {
  constructor(private readonly mailService: MailService) {}

  async sendWelcomeEmail(email: string) {
    await this.mailService.sendEmail({
      to: email,
      subject: 'Welcome!',
      html: '<h1>Welcome to our platform!</h1>',
    });
  }
}
```

### Verification Code Service

```typescript
import { MailCodeService } from '@meta-1/nest-message';

@Injectable()
export class AuthService {
  constructor(private readonly mailCodeService: MailCodeService) {}

  async sendVerificationCode(email: string) {
    await this.mailCodeService.send({
      email,
      action: 'register',
    });
  }

  async verifyCode(email: string, code: string) {
    const isValid = await this.mailCodeService.verify(
      email,
      'register',
      code
    );
    
    if (!isValid) {
      throw new Error('Invalid verification code');
    }
  }
}
```

## 🚨 Error Codes

The message module defines its own error codes in the range **1000-1999**.

### Import

```typescript
import { AppError } from '@meta-1/nest-common';
import { MessageErrorCode } from '@meta-1/nest-message';
```

### Verification Code Errors (1000-1099)

| Error Code | Code | Message |
|-----------|------|---------|
| `VERIFICATION_CODE_STORAGE_FAILED` | 1000 | Verification code storage failed |
| `EMAIL_SENDING_FAILED` | 1001 | Email sending failed |
| `VERIFICATION_CODE_SEND_FAILED` | 1002 | Failed to send verification code |
| `VERIFICATION_CODE_EXPIRED` | 1003 | Verification code expired or does not exist |
| `VERIFICATION_CODE_INCORRECT` | 1004 | Verification code incorrect |

### Mail Service Errors (1100-1199)

| Error Code | Code | Message |
|-----------|------|---------|
| `MAIL_SERVICE_NOT_CONFIGURED` | 1100 | Mail service not configured correctly |
| `MAIL_CONTENT_EMPTY` | 1101 | Email content cannot be empty |

### Usage Example

```typescript
import { AppError } from '@meta-1/nest-common';
import { MessageErrorCode } from '@meta-1/nest-message';

@Injectable()
export class MailCodeService {
  async send(email: string) {
    try {
      await this.redis.setex(key, 300, code);
    } catch (error) {
      // Use predefined error code
      throw new AppError(MessageErrorCode.VERIFICATION_CODE_STORAGE_FAILED);
    }
  }
  
  async verify(email: string, code: string) {
    const storedCode = await this.redis.get(key);
    
    if (!storedCode) {
      // Error code includes both code and message
      throw new AppError(MessageErrorCode.VERIFICATION_CODE_EXPIRED);
    }
    
    if (storedCode !== code) {
      throw new AppError(MessageErrorCode.VERIFICATION_CODE_INCORRECT);
    }
  }
}
```

## 📝 API Reference

### Classes

- `MailService` - Email sending service with AWS SES and Aliyun DirectMail support
- `MailCodeService` - Verification code management service with Redis

### Error Codes

- `MessageErrorCode` - Type-safe error code definitions for the message module

### Types

- `MessageErrorCodeType` - TypeScript type for all message error codes
- `MessageErrorCodeValue` - Union type of all error code values

## 📄 License

MIT

