"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptCategorizationChain = promptCategorizationChain;
const prompts_1 = require("@langchain/core/prompts");
const zod_1 = require("zod");
const categorization_1 = require("../types/categorization");
const examplePrompts = [
    {
        prompt: 'Monitor social channels for product mentions and auto-respond with campaign messages',
        techniques: [
            categorization_1.WorkflowTechnique.MONITORING,
            categorization_1.WorkflowTechnique.CHATBOT,
            categorization_1.WorkflowTechnique.CONTENT_GENERATION,
        ],
    },
    {
        prompt: 'Collect partner referral submissions and verify client instances via BigQuery',
        techniques: [
            categorization_1.WorkflowTechnique.FORM_INPUT,
            categorization_1.WorkflowTechnique.HUMAN_IN_THE_LOOP,
            categorization_1.WorkflowTechnique.NOTIFICATION,
        ],
    },
    {
        prompt: 'Scrape competitor pricing pages weekly and generate a summary report of changes',
        techniques: [
            categorization_1.WorkflowTechnique.SCHEDULING,
            categorization_1.WorkflowTechnique.SCRAPING_AND_RESEARCH,
            categorization_1.WorkflowTechnique.DATA_EXTRACTION,
            categorization_1.WorkflowTechnique.DATA_ANALYSIS,
        ],
    },
    {
        prompt: 'Process uploaded PDF contracts to extract client details and update CRM records',
        techniques: [
            categorization_1.WorkflowTechnique.DOCUMENT_PROCESSING,
            categorization_1.WorkflowTechnique.DATA_EXTRACTION,
            categorization_1.WorkflowTechnique.DATA_TRANSFORMATION,
            categorization_1.WorkflowTechnique.ENRICHMENT,
        ],
    },
    {
        prompt: 'Build a searchable internal knowledge base from past support tickets',
        techniques: [
            categorization_1.WorkflowTechnique.DATA_TRANSFORMATION,
            categorization_1.WorkflowTechnique.DATA_ANALYSIS,
            categorization_1.WorkflowTechnique.KNOWLEDGE_BASE,
        ],
    },
];
function formatExamplePrompts() {
    return examplePrompts
        .map((example) => `- ${example.prompt} → ${example.techniques.join(',')}`)
        .join('\n');
}
const promptCategorizationTemplate = prompts_1.PromptTemplate.fromTemplate(`Analyze the following user prompt and identify the workflow techniques required to fulfill the request.
Be specific and identify all relevant techniques.

<user_prompt>
{userPrompt}
</user_prompt>

<workflow_techniques>
{techniques}
</workflow_techniques>

The following prompt categorization examples show a prompt → techniques involved to provide a sense
of how the categorization should be carried out.
<example_categorization>
${formatExamplePrompts()}
</example_categorization>

Select a maximum of 5 techniques that you believe are applicable, but only select them if you are
confident that they are applicable. If the prompt is ambigious or does not provide an obvious workflow
do not provide any techniques - if confidence is low avoid providing techniques.

Select ALL techniques that apply to this workflow. Most workflows use multiple techniques.
Rate your confidence in this categorization from 0.0 to 1.0.
`);
function formatTechniqueList() {
    return Object.entries(categorization_1.TechniqueDescription)
        .map(([key, description]) => `- **${key}**: ${description}`)
        .join('\n');
}
async function promptCategorizationChain(llm, userPrompt) {
    const categorizationSchema = zod_1.z.object({
        techniques: zod_1.z
            .array(zod_1.z.nativeEnum(categorization_1.WorkflowTechnique))
            .min(0)
            .max(5)
            .describe('Zero to five workflow techniques identified in the prompt (maximum of 5)'),
        confidence: zod_1.z
            .number()
            .min(0)
            .max(1)
            .describe('Confidence level in this categorization from 0.0 to 1.0'),
    });
    const modelWithStructure = llm.withStructuredOutput(categorizationSchema);
    const prompt = await promptCategorizationTemplate.invoke({
        userPrompt,
        techniques: formatTechniqueList(),
    });
    const structuredOutput = await modelWithStructure.invoke(prompt);
    return {
        techniques: structuredOutput.techniques,
        confidence: structuredOutput.confidence,
    };
}
//# sourceMappingURL=prompt-categorization.js.map