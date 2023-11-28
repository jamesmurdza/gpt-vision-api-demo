# GPT Vision API Demo

This is a demo of a NodeJS backend that uses GPT-4 with Vision to analyze an uploaded image.

## Setup

**OpenAI API:**

- Create a [new API key](https://platform.openai.com/account/api-keys) and store it in .env.

**Firebase:**

- Create a [Firebase project](https://console.firebase.google.com/) with Storage.
- Add the project ID to .env.
- Download credentials.json and store this file in the project directory.

**Environment variables:**

Your .env file should look like this:

```bash
OPENAI_API_KEY=sk-xxxxxxx-xxxxxxx-xxxxxxx-xxxxxxx
GCS_PROJECT_ID=my-project-id
```

You can optionally add the `PORT` variable (defaults to 4000).

## Running

In Terminal, run:

```bash
yarn install
yarn start
```

## Testing

Once the server is up and running, you can test the API as follows:

```bash
curl -F file=@./path/to/my_image.png http://localhost:4000/upload
```

You should get a result similar to the following:

```json
{"response":"This is an image of a person sitting down with a dog. The dog appears to be a large, fluffy breed with a black and white coat, possibly an Alaskan Malamute or a similar breed. The dog is wearing a collar with a festive design. The person is wearing a plaid shirt and black pants, and there is a leash, suggesting that they may have been walking the dog or are about to."}
```

