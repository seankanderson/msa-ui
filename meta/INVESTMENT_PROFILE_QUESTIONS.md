# Investment Profile Questions

This document covers everything you need to know about the investment profile questions feature: data model, operator scheme, question set names, auto-seeding, the API endpoint, and how to extend the feature.

---

## Table of Contents

- [Overview](#overview)
- [Data Model](#data-model)
  - [InvestmentProfileQuestionsDocument](#investmentprofilequestionsdocument)
  - [InvestmentProfileQuestion](#investmentprofilequestion)
  - [QuestionCondition](#questioncondition)
  - [FollowUpQuestionGroup](#followupquestiongroup)
- [Question Types](#question-types)
- [Operator Scheme](#operator-scheme)
- [Question Set Names](#question-set-names)
- [Default Question Set](#default-question-set)
- [Auto-Seeding](#auto-seeding)
- [Service Layer](#service-layer)
- [API Endpoint](#api-endpoint)
- [How to Add a New Question Set](#how-to-add-a-new-question-set)

---

## Overview

Investment profile questions define the form that clients fill out when building their investment profile. Supervisors manage question sets; clients and advisors read them.

Question sets follow the same **draft → current → archived** lifecycle used throughout this API. Only one `current` set (per named set) and one `draft` can exist at a time. When a draft is published, the current set is archived and the draft becomes current.

---

## Data Model

All types live in `database/models/InvestmentProfileQuestionsDocument.cs`.

### InvestmentProfileQuestionsDocument

Top-level document stored in the `investmentProfileQuestions` collection.

| Field                    | Type                              | Description                                                                                                                                      |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Id`                     | `string`                          | GUID. Document/question-set ID.                                                                                                                  |
| `Name`                   | `string`                          | Question set name, e.g. `"basic-individual-investment-profile"`. Used to distinguish between different question sets for different client types. |
| `Status`                 | `string`                          | `"current"`, `"draft"`, or `"archived"`.                                                                                                         |
| `Questions`              | `List<InvestmentProfileQuestion>` | Ordered list of top-level questions.                                                                                                             |
| `Description`            | `string`                          | Human-readable description of the set.                                                                                                           |
| `CreatedDate`            | `DateTime`                        | When the set was created.                                                                                                                        |
| `CreatedBy`              | `string`                          | UserId (or `"system"` for auto-seeded sets).                                                                                                     |
| `LastModifiedDate`       | `DateTime`                        | When the set was last modified.                                                                                                                  |
| `LastModifiedBy`         | `string`                          | UserId or `"system"`.                                                                                                                            |
| `PublishedDate`          | `DateTime?`                       | When the draft was published to current.                                                                                                         |
| `PublishedBy`            | `string`                          | UserId who published.                                                                                                                            |
| `ArchivedDate`           | `DateTime?`                       | When the set was archived.                                                                                                                       |
| `ArchiveRetentionExpiry` | `DateTime?`                       | Retention expiry (5 years, same as investment profiles).                                                                                         |
| `CreatedAt`              | `DateTime`                        | UTC timestamp.                                                                                                                                   |
| `UpdatedAt`              | `DateTime`                        | UTC timestamp.                                                                                                                                   |

---

### InvestmentProfileQuestion

Represents a single question in a set (including follow-up questions nested inside `FollowUpQuestionGroup`).

| Field                     | Type                          | Description                                                                                                    |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Id`                      | `string`                      | Stable snake_case identifier, e.g. `"date_of_birth"`. Used by the client app to map answers back to questions. |
| `Title`                   | `string`                      | Short display label.                                                                                           |
| `Content`                 | `string`                      | The full question text shown to the client.                                                                    |
| `Type`                    | `string`                      | See [Question Types](#question-types).                                                                         |
| `IsRequired`              | `bool`                        | Whether the client must answer before submitting.                                                              |
| `DisplayOrder`            | `int`                         | Sort order within its parent list.                                                                             |
| `Choices`                 | `List<string>`                | Valid choices for `multipleChoice` questions. `null` for other types.                                          |
| `AllowsMultipleResponses` | `bool`                        | `true` if the client can submit more than one answer (e.g. listing multiple retirement accounts).              |
| `FollowUpQuestions`       | `List<FollowUpQuestionGroup>` | Conditional groups of questions shown based on this question's answer.                                         |
| `MinValue`                | `decimal?`                    | Minimum for numeric types.                                                                                     |
| `MaxValue`                | `decimal?`                    | Maximum for numeric types.                                                                                     |
| `HelpText`                | `string`                      | Optional hint text shown below the question.                                                                   |
| `CreatedAt`               | `DateTime`                    | UTC timestamp.                                                                                                 |
| `UpdatedAt`               | `DateTime`                    | UTC timestamp.                                                                                                 |

---

### QuestionCondition

Defines when a `FollowUpQuestionGroup` should be shown. Uses a uniform `{ operator, value }` shape so every condition type has the same structure.

| Field      | Type     | Description                                                           |
| ---------- | -------- | --------------------------------------------------------------------- |
| `Operator` | `string` | See [Operator Scheme](#operator-scheme).                              |
| `Value`    | `string` | The comparison value as a string (e.g. `"true"`, `"pay"`, `"50000"`). |

---

### FollowUpQuestionGroup

A set of follow-up questions that appears when the parent question's answer satisfies the condition.

| Field       | Type                              | Description                                                                                                       |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Condition` | `QuestionCondition`               | The condition that triggers this group.                                                                           |
| `Questions` | `List<InvestmentProfileQuestion>` | The follow-up questions to show. Follow-up questions can themselves have `FollowUpQuestions` (nested follow-ups). |

---

## Question Types

| Type             | Description                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `boolean`        | True/false question. Answer submitted as the string `"true"` or `"false"`.                            |
| `multipleChoice` | Client picks one value from `Choices`. Answer is the chosen string.                                   |
| `freeform`       | Open text entry. If `AllowsMultipleResponses` is `true`, the client can submit multiple text entries. |
| `date`           | Date picker. ISO 8601 string.                                                                         |
| `integer`        | Whole number.                                                                                         |
| `decimal`        | Decimal/currency number.                                                                              |

---

## Operator Scheme

Conditions use a uniform `{ operator, value }` shape. Every operator takes a `value` field — there are no value-less operators like `isTrue`. This keeps the client-side evaluation logic consistent: always read `condition.operator` and `condition.value`.

| Operator   | Meaning                                            | Example                                                                                                 |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `eq`       | Answer equals value (case-insensitive)             | `{ "operator": "eq", "value": "true" }` — show follow-up when boolean answer is true                    |
| `neq`      | Answer does not equal value                        | `{ "operator": "neq", "value": "Neither" }`                                                             |
| `contains` | Answer string contains value (case-insensitive)    | `{ "operator": "contains", "value": "pay" }` — matches "I pay child support" and "Both pay and receive" |
| `gt`       | Answer (numeric) is greater than value             | `{ "operator": "gt", "value": "50000" }`                                                                |
| `lt`       | Answer (numeric) is less than value                | `{ "operator": "lt", "value": "0" }`                                                                    |
| `gte`      | Answer (numeric) is greater than or equal to value | `{ "operator": "gte", "value": "1" }`                                                                   |
| `lte`      | Answer (numeric) is less than or equal to value    | `{ "operator": "lte", "value": "100" }`                                                                 |

> **Why not `isTrue`?** The original JSON used `{ "operator": "isTrue" }` (no value) for boolean follow-ups, and `{ "operator": "contains", "value": "..." }` for choice follow-ups. Two different shapes creates two code paths on the client. The `eq` operator eliminates this by always requiring a value, so the client evaluates every condition the same way.

---

## Question Set Names

Named in `services/InvestmentProfileQuestionsService.cs` as constants on `QuestionSetName`:

```csharp
public static class QuestionSetName
{
    public const string BasicIndividualInvestmentProfile = "basic-individual-investment-profile";

    public static readonly IReadOnlyList<string> ValidNames = new[]
    {
        BasicIndividualInvestmentProfile
    };
}
```

The name is passed as a `?name=` query parameter to the API endpoint. If omitted, it defaults to `basic-individual-investment-profile`.

When adding a new set for a different client type (e.g. joint accounts, business accounts), add a new constant here and a new entry in `ValidNames`. No endpoint changes are needed.

---

## Default Question Set

`basic-individual-investment-profile` contains 11 questions in display order:

| #   | Id                        | Type             | Required | Follow-ups                                                                                                              |
| --- | ------------------------- | ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | `date_of_birth`           | `date`           | Yes      | —                                                                                                                       |
| 2   | `marital_status`          | `multipleChoice` | Yes      | —                                                                                                                       |
| 3   | `dependents`              | `boolean`        | Yes      | `dependents_count` (integer) if answer `eq "true"`                                                                      |
| 4   | `child_support_status`    | `multipleChoice` | Yes      | `child_support_paid_amount` if answer `contains "pay"` · `child_support_received_amount` if answer `contains "receive"` |
| 5   | `alimony_status`          | `multipleChoice` | Yes      | `alimony_paid_amount` if answer `contains "pay"` · `alimony_received_amount` if answer `contains "receive"`             |
| 6   | `employment_status`       | `multipleChoice` | Yes      | —                                                                                                                       |
| 7   | `old_retirement_accounts` | `boolean`        | Yes      | `retirement_account_details` (freeform, multiple) if answer `eq "true"`                                                 |
| 8   | `credit_cards`            | `boolean`        | Yes      | `credit_card_details` (freeform, multiple) if answer `eq "true"`                                                        |
| 9   | `vehicles`                | `boolean`        | Yes      | `vehicle_details` (freeform, multiple) if answer `eq "true"`                                                            |
| 10  | `financial_goals`         | `freeform`       | Yes      | — (multiple responses allowed)                                                                                          |
| 11  | `acknowledgement`         | `boolean`        | Yes      | —                                                                                                                       |

### Choices for multipleChoice questions

**`marital_status`**: Single, Married, Divorced, Separated, Widowed

**`child_support_status`**: I pay child support, I receive child support, Both pay and receive, Neither

**`alimony_status`**: I pay alimony, I receive alimony, Both pay and receive, Neither

**`employment_status`**: Full-time, Part-time, Self-employed, Union worker, Retired, Not currently working

---

## Auto-Seeding

The first time `GET /api/investment-profile-questions/current` is called for a given name and no `current` document exists in the database, the service automatically seeds the default question set and saves it as `status: "current"`.

This means:
- Fresh environments (local dev, new deployments) work immediately with no manual data setup.
- The seeded document has `createdBy: "system"` and `publishedBy: "system"`.
- Once seeded, supervisors can create a draft, modify it, and publish to replace the auto-seeded set via the normal draft workflow.

The seed logic lives in `InvestmentProfileQuestionsService.BuildDefaultQuestionSet()` and `BuildDefaultQuestions()`.

---

## Service Layer

**`services/InvestmentProfileQuestionsService.cs`**

```
IInvestmentProfileQuestionsService
  └── GetCurrentAsync(name) → InvestmentProfileQuestionsDocument
```

- Queries `investmentProfileQuestions` where `status == "current" && name == name`.
- If no result: builds the default question set, persists it, and returns it.
- Registered in DI as scoped: `services.AddInvestmentProfileQuestionsService()`.

**Repository** (`ICosmosDbService.GetInvestmentProfileQuestionsRepository()`):
- Collection: `investmentProfileQuestions`
- Lazy-initialized (same pattern as all other repositories in `CosmosDbService`).

---

## API Endpoint

### `GET /api/investment-profile-questions/current`

Returns the current active question set. Auto-seeds the default set on first call if the database is empty.

**Authentication**: Bearer JWT required (all roles: `client`, `advisor`, `associate`, `supervisor`).

> All roles can read questions because clients need them to fill out their investment profile form.

#### Query Parameters

| Parameter | Type     | Default                               | Description                                                                    |
| --------- | -------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `name`    | `string` | `basic-individual-investment-profile` | The question set to return. Must be a value from `QuestionSetName.ValidNames`. |

#### Example Request

```http
GET /api/investment-profile-questions/current
Authorization: Bearer <access_token>
```

```http
GET /api/investment-profile-questions/current?name=basic-individual-investment-profile
Authorization: Bearer <access_token>
```

#### Success Response — `200 OK`

Returns the full `InvestmentProfileQuestionsDocument` as JSON, including all nested questions, choices, and follow-up groups.

```json
{
  "id": "3f2e1a00-...",
  "name": "basic-individual-investment-profile",
  "status": "current",
  "description": "Basic individual investment profile questions",
  "questions": [
    {
      "id": "date_of_birth",
      "title": "Date of Birth",
      "content": "What is your date of birth?",
      "type": "date",
      "isRequired": true,
      "displayOrder": 1,
      "choices": null,
      "allowsMultipleResponses": false,
      "followUpQuestions": []
    },
    {
      "id": "dependents",
      "title": "People You Support",
      "content": "Do you help support any children or other dependents?",
      "type": "boolean",
      "isRequired": true,
      "displayOrder": 3,
      "followUpQuestions": [
        {
          "condition": { "operator": "eq", "value": "true" },
          "questions": [
            {
              "id": "dependents_count",
              "title": "Number of Dependents",
              "content": "How many people do you help support?",
              "type": "integer",
              "isRequired": false,
              "displayOrder": 1
            }
          ]
        }
      ]
    }
  ],
  "publishedDate": "2026-03-30T00:00:00Z",
  "publishedBy": "system",
  "createdAt": "2026-03-30T00:00:00Z",
  "updatedAt": "2026-03-30T00:00:00Z"
}
```

#### Error Responses

| Status                      | Condition                                                |
| --------------------------- | -------------------------------------------------------- |
| `400 Bad Request`           | `name` parameter is not in `QuestionSetName.ValidNames`. |
| `401 Unauthorized`          | Missing, invalid, or expired Bearer token.               |
| `500 Internal Server Error` | Database read/write failure.                             |

#### Audit Log

Every successful request writes an `investment_profile_questions_viewed` audit event:

```json
{
  "eventType": "investment_profile_questions_viewed",
  "action": "read",
  "userId": "<caller-user-id>",
  "details": {
    "questionSetId": "3f2e1a00-...",
    "questionSetName": "basic-individual-investment-profile",
    "status": "current"
  }
}
```

---

## How to Add a New Question Set

For example, adding a `joint-investment-profile` set for joint accounts:

### 1. Register the name

In `services/InvestmentProfileQuestionsService.cs`:

```csharp
public static class QuestionSetName
{
    public const string BasicIndividualInvestmentProfile = "basic-individual-investment-profile";
    public const string JointInvestmentProfile = "joint-investment-profile";   // ← new

    public static readonly IReadOnlyList<string> ValidNames = new[]
    {
        BasicIndividualInvestmentProfile,
        JointInvestmentProfile   // ← new
    };
}
```

### 2. Add seed data

In `InvestmentProfileQuestionsService.BuildDefaultQuestionSet()`, switch on `name` and return the appropriate question list:

```csharp
private static InvestmentProfileQuestionsDocument BuildDefaultQuestionSet(string name)
{
    var now = DateTime.UtcNow;
    return new InvestmentProfileQuestionsDocument
    {
        Id = Guid.NewGuid().ToString(),
        Name = name,
        Status = "current",
        Description = name switch
        {
            QuestionSetName.JointInvestmentProfile => "Joint investment profile questions",
            _ => "Basic individual investment profile questions"
        },
        Questions = name switch
        {
            QuestionSetName.JointInvestmentProfile => BuildJointQuestions(),
            _ => BuildDefaultQuestions()
        },
        // ...timestamps and createdBy = "system"
    };
}
```

### 3. Done

The endpoint already validates against `ValidNames` and routes to `GetCurrentAsync(name)`. The new set will auto-seed on first request, just like the default.
