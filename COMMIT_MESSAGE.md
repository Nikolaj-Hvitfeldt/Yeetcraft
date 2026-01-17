```
refactor(backend): improve architecture and add error handling

- Move DTOs to dedicated package for better separation of concerns
- Add error handling in controllers with proper HTTP status codes
- Replace String with MistakeType enum for type safety
- Add configuration validation on startup
- Implement graceful database shutdown hook
- Replace println with proper logging (SLF4J/Logback)
- Add CORS support for development
- Add StatusPages for unhandled exceptions
- Make JSON prettyPrint environment-dependent

Frontend: Update TypeScript types to match backend (MistakeType union)

Breaking: MistakeDto.type is now enum (runtime compatible, type-safe)
```
