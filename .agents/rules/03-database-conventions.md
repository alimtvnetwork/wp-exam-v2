# Database Conventions Agent Rules

> Authoritative database conventions synthesized from `02-spec/04-database-conventions/`.

1. **Singular Table Names**: Table names must be singular PascalCase (e.g. `Quiz`, `Question`, `User`).
2. **Column Naming**: Columns use PascalCase (`QuizId`, `CreatedAt`, `DisplayOrder`).
3. **Primary Key Pattern**: PK must be `{TableName}Id` (`INTEGER PRIMARY KEY AUTOINCREMENT` or `BIGINT AUTO_INCREMENT`). No UUIDs unless strictly required.
4. **Foreign Key Matching**: FK column name must match the target PK exactly (e.g. `QuizId` in `QuizQuestion` references `Quiz.QuizId`).
5. **Positive Booleans**: Use positive booleans starting with `Is` or `Has` (`IsCorrect`, `IsActive`). Inverted fields must be generated computed properties in code, not extra DB columns.
6. **Description / Notes Nullability**: Entity/reference tables must have `Description TEXT NULL`. Transactional tables must have `Notes TEXT NULL` and `Comments TEXT NULL`. All nullable, no `DEFAULT`.
