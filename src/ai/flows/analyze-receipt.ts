
'use server';

/**
 * @fileOverview Analyzes a grocery receipt image to extract store name, items, quantities, and prices.
 * It also compares the extracted items with the original shopping list to identify forgotten and impulse buys.
 *
 * - analyzeReceipt - A function that handles the receipt analysis process.
 * - AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * - AnalyzeReceiptOutput - The return type for the analyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a grocery receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  originalItems: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
  })).describe('The original list of items the user intended to buy.'),
});
export type AnalyzeReceiptInput = z.infer<typeof AnalyzeReceiptInputSchema>;


const AnalyzeReceiptOutputSchema = z.object({
  storeName: z.string().describe('The name of the store.'),
  items: z.array(
    z.object({
      name: z.string().describe('The name of the item.'),
      quantity: z.number().describe('The quantity of the item.'),
      price: z.number().describe('The price of the item.'),
    })
  ).describe('The list of items extracted from the receipt.'),
  comparison: z.object({
    forgottenItems: z.array(z.string()).describe('Items that were on the original list but not on the receipt.'),
    impulseBuys: z.array(z.string()).describe('Items that are on the receipt but were not on the original list.'),
  }).describe('A comparison between the original list and the receipt.'),
});
export type AnalyzeReceiptOutput = z.infer<typeof AnalyzeReceiptOutputSchema>;

export async function analyzeReceipt(input: AnalyzeReceiptInput): Promise<AnalyzeReceiptOutput> {
  return analyzeReceiptFlow(input);
}

const analyzeReceiptPrompt = ai.definePrompt({
  name: 'analyzeReceiptPrompt',
  input: {schema: AnalyzeReceiptInputSchema},
  output: {schema: AnalyzeReceiptOutputSchema},
  prompt: `You are an expert grocery receipt analyzer and shopping assistant.

Your task is to perform two main functions:
1.  Extract the store name, and a list of all items, quantities, and prices from the receipt image provided.
2.  Compare the items found on the receipt with the user's original shopping list, which is provided as a JSON object.

Based on the comparison, identify:
-   **Forgotten Items:** Items that were on the original shopping list but are NOT on the receipt.
-   **Impulse Buys:** Items that are on the receipt but were NOT on the original shopping list.

Return all of this information in the required JSON format.

Original Shopping List:
{{json originalItems}}

Receipt Image:
{{media url=receiptDataUri}}`,
});

const analyzeReceiptFlow = ai.defineFlow(
  {
    name: 'analyzeReceiptFlow',
    inputSchema: AnalyzeReceiptInputSchema,
    outputSchema: AnalyzeReceiptOutputSchema,
  },
  async input => {
    const {output} = await analyzeReceiptPrompt(input);
    return output!;
  }
);
