# BidBridge — B2B RFQ Marketplace

BidBridge is a construction-procurement marketplace concept for turning informal material requests into structured requests for quotation (RFQs). Buyers can describe the materials they need, review the extracted details, and receive bids from sellers. The project uses AI-assisted parsing to help structure requests; AI output should always be reviewed before submission.

**Repository:** https://github.com/PranavDDabade/bidbridge  
**Live demo:** Add your deployed URL here once deployment is complete.

## Features

- **RFQ creation:** Enter a material request using text and, where supported by the browser, voice input.
- **AI-assisted parsing:** Extract material names, quantities, units, location, and requested deadline from natural-language text.
- **Review and correction:** Treat extracted values as suggestions; check missing or ambiguous fields before submitting.
- **Buyer and seller workflows:** Separate views for buyers managing RFQs and sellers browsing requests or managing bids.
- **Real-time updates:** Firebase/Firestore can keep RFQ and bid data synchronized when configured in the application.

> AI extraction is assistive, not an approval or purchasing decision. Verify quantities, units, dates, locations, and any pricing before acting on an RFQ.

## How AI parsing is designed

The extraction prompt asks the model to return structured JSON containing `items`, `location`, `neededBy`, `missing`, and confidence information. A separate grounding prompt checks whether extracted values are supported by the original request and flags suspicious values for review.

Example response shape (illustrative only):

```json
{
  "items": [
    {
      "name": "cement",
      "quantity": 50,
      "unit": "bags",
      "confidence": 0.96
    }
  ],
  "location": "Pune",
  "neededBy": null,
  "missing": ["neededBy"],
  "confidence": {
    "overall": 0.9,
    "location": 0.95,
    "neededBy": 0.5
  }
}
```

The values above are examples, not a claim about a live model response. Prompt instructions alone do not guarantee correct output. The application should validate model responses in code and require human review for uncertain or suspicious values.

### Prompt design choices

- **Structured output:** Requests a predictable JSON shape for downstream processing.
- **Missing-field reporting:** Makes absent details explicit rather than silently filling them in.
- **Constrained normalization:** Allows likely speech-recognition corrections only when the surrounding words support them.
- **Separate grounding pass:** Checks extracted details against the original request.
- **Human review:** Keeps the buyer in control of corrections and submission.

See [`AI_PROMPT_LOG.md`](./AI_PROMPT_LOG.md) for the prompt log. Keep that document aligned with the prompts and validation code actually present in the repository.

## Technology stack

The project uses the following technologies, as applicable to the current repository configuration:

- Next.js and React
- TypeScript
- Firebase Authentication and Cloud Firestore
- Tailwind CSS and UI components
- Zod for schema validation
- Google Gemini for AI-assisted parsing
- Web Speech API for browser voice input, where supported

Check `package.json` and the application configuration for the exact installed versions and enabled services.

## Getting started

### Prerequisites

- A Node.js version compatible with the installed Next.js version
- npm
- A Firebase project if you intend to use live Firebase services
- A Gemini API key if the AI parsing endpoint requires it
- Java on your `PATH` only if you plan to run the Firestore emulator

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the repository root. The exact variable names must match the project's Firebase initialization and AI API code. Common Firebase web configuration names include:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=
```

Only include variables that the code actually reads. Never commit `.env.local`, service-account files, private keys, API tokens, or real credentials. If a credential has been exposed, revoke it and replace it.

### Run locally

```bash
npm run dev
```

Open http://localhost:3000.

### Build and run

```bash
npm run build
npm run start
```

Check `package.json` for the scripts available in this checkout; a script such as `npm run lint` may not be configured.

## Firebase emulator setup (optional)

The Firebase CLI needs a `firebase.json` configuration file to start emulators. If the repository does not already have one, initialize the required emulator configuration from the project root:

```powershell
firebase init emulators
```

Choose only the emulators the application needs and preserve existing configuration when prompted. Then run either:

```powershell
firebase emulators:start
```

or, for Firestore only:

```powershell
firebase emulators:start --only firestore
```

The Firestore emulator requires Java. Check the installation with:

```powershell
java --version
```

Starting an emulator does not automatically connect the app to it. The Firebase initialization code must explicitly connect to local emulator endpoints in development. Do not point a production deployment at local emulator addresses.

## Architecture decisions

- **Next.js and TypeScript:** Provide application routing and typed UI code.
- **Firebase/Firestore:** Provide authentication and a managed data store with real-time listeners.
- **AI extraction plus grounding:** Separates initial parsing from a second check, at the cost of extra latency and API usage.
- **Voice input as an enhancement:** Keeps text input available for browsers or users that cannot use speech recognition.
- **Human review:** Avoids treating model confidence or a grounding result as proof that extracted data is correct.

These are design intentions; confirm implementation details in the source code before describing any behavior as complete or production-ready.

## Limitations and future improvements

With more time, I would prioritize:

1. **Automated tests:** Cover schema validation, missing fields, ambiguous quantities, speech-to-text errors, and grounding failures.
2. **Evaluation dataset:** Measure extraction accuracy against representative procurement requests instead of assuming a prompt is reliable.
3. **Clarification flow:** Ask buyers targeted follow-up questions when required information is missing or uncertain.
4. **Marketplace discovery:** Add useful search and filters for material, location, price, and lead time.
5. **Notifications and reputation:** Notify users about bid activity and help buyers evaluate seller reliability.
6. **Transaction workflow:** Add a carefully scoped payment and dispute process only after core RFQ and bidding flows are reliable.

## Project status

This README describes the intended workflow and setup approach. It does not by itself verify that every feature, security rule, emulator, or deployment has been tested. Before submission, run the app and production build, verify the buyer and seller flows, review the Firestore rules, and update this document to reflect the actual behavior of the current code.

## Related files

- [`AI_PROMPT_LOG.md`](./AI_PROMPT_LOG.md) — AI prompts and iteration notes
- [`firestore.rules`](./firestore.rules) — Firestore security rules, if present in this checkout

---

Built for the React / Firebase internship assignment.
