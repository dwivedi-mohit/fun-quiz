import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, "../src/data/questions.js");

// Helper to shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Procedural question generator engine
function generateCategoryQuestions(category, templates, entities, count) {
  const questions = new Set();
  const results = [];
  
  while (results.length < count) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    
    // Fill template
    let qText = template.q.replace(/{NAME}/g, entity.name).replace(/{DESC}/g, entity.desc).replace(/{FEATURE}/g, entity.feature);
    
    if (!questions.has(qText)) {
      questions.add(qText);
      
      // Generate options
      let options = [template.a.replace(/{NAME}/g, entity.name).replace(/{DESC}/g, entity.desc).replace(/{FEATURE}/g, entity.feature)];
      
      // Get 3 fake options from other entities
      const fakes = shuffle(entities.filter(e => e.name !== entity.name)).slice(0, 3);
      fakes.forEach(f => {
        options.push(template.fake.replace(/{NAME}/g, f.name).replace(/{DESC}/g, f.desc).replace(/{FEATURE}/g, f.feature));
      });
      
      options = shuffle(options);
      const correctIdx = options.findIndex(o => o === template.a.replace(/{NAME}/g, entity.name).replace(/{DESC}/g, entity.desc).replace(/{FEATURE}/g, entity.feature));
      
      results.push({
        id: `${category.replace(/\s+/g, '').toLowerCase()}-${crypto.randomBytes(4).toString("hex")}`,
        category,
        question: qText,
        options,
        correctAnswer: correctIdx,
        explanation: template.exp.replace(/{NAME}/g, entity.name).replace(/{DESC}/g, entity.desc).replace(/{FEATURE}/g, entity.feature)
      });
    }
  }
  return results;
}

// === AWS DATA ===
const awsEntities = [
  { name: "Amazon EC2", desc: "Virtual Servers in the Cloud", feature: "resizable compute capacity" },
  { name: "Amazon S3", desc: "Object Storage", feature: "99.999999999% durability" },
  { name: "Amazon RDS", desc: "Managed Relational Database Service", feature: "automated backups and patching for SQL" },
  { name: "AWS Lambda", desc: "Serverless Compute", feature: "running code without provisioning servers" },
  { name: "Amazon DynamoDB", desc: "Managed NoSQL Database", feature: "single-digit millisecond latency" },
  { name: "Amazon CloudFront", desc: "Content Delivery Network (CDN)", feature: "caching content at edge locations" },
  { name: "Amazon Route 53", desc: "Scalable Domain Name System (DNS)", feature: "health-checking and traffic routing" },
  { name: "Amazon VPC", desc: "Virtual Private Cloud", feature: "isolated cloud network environments" },
  { name: "AWS IAM", desc: "Identity and Access Management", feature: "managing access to AWS services" },
  { name: "Amazon CloudWatch", desc: "Monitoring and Management Service", feature: "collecting logs, metrics, and events" },
  { name: "AWS CloudFormation", desc: "Infrastructure as Code", feature: "provisioning resources using templates" },
  { name: "Amazon SQS", desc: "Fully Managed Message Queuing", feature: "decoupling microservices" },
  { name: "Amazon SNS", desc: "Fully Managed Pub/Sub Messaging", feature: "sending notifications and SMS" },
  { name: "Amazon Redshift", desc: "Fast, Scalable Data Warehouse", feature: "analyzing massive datasets with SQL" },
  { name: "AWS Elastic Beanstalk", desc: "Platform as a Service (PaaS)", feature: "deploying web applications quickly" },
  { name: "Amazon EKS", desc: "Managed Kubernetes Service", feature: "running containerized applications" },
  { name: "Amazon Athena", desc: "Interactive Query Service", feature: "querying data in S3 using standard SQL" },
  { name: "AWS CloudTrail", desc: "Governance and Compliance Auditing", feature: "tracking user activity and API usage" },
  { name: "AWS KMS", desc: "Key Management Service", feature: "creating and managing cryptographic keys" },
  { name: "AWS WAF", desc: "Web Application Firewall", feature: "protecting against common web exploits" },
  { name: "Amazon ElastiCache", desc: "In-Memory Caching Service", feature: "sub-millisecond latency for real-time apps" },
  { name: "AWS Step Functions", desc: "Serverless Visual Workflow", feature: "orchestrating distributed applications" },
  { name: "AWS Secrets Manager", desc: "Credential Management Service", feature: "rotating and managing database credentials" },
  { name: "Amazon Cognito", desc: "Customer Identity and Access Management", feature: "adding user sign-up and sign-in to apps" },
  { name: "Amazon EventBridge", desc: "Serverless Event Bus", feature: "connecting applications using events" }
];

const awsTemplates = [
  { q: "Which AWS service is best defined as '{DESC}'?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} provides {FEATURE}, making it the ideal choice for {DESC}." },
  { q: "A company needs {FEATURE}. Which AWS service should they choose?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is designed specifically for {DESC} and offers {FEATURE}." },
  { q: "What is the primary use case for {NAME}?", a: "{DESC}", fake: "{DESC}", exp: "{NAME} is used for {DESC} because it provides {FEATURE}." },
  { q: "If a developer wants to implement {DESC}, they should utilize:", a: "{NAME}", fake: "{NAME}", exp: "Implementing {DESC} is the core functionality of {NAME}." },
  { q: "Which of the following services offers {FEATURE} natively?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} natively supports {FEATURE}." },
  { q: "To achieve {DESC} with high availability, which service is recommended?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is a highly available service for {DESC}." },
  { q: "What is the main advantage of using {NAME} over self-managed solutions?", a: "It provides managed {FEATURE}", fake: "It provides managed {FEATURE}", exp: "{NAME} offloads the operational burden of {DESC}." },
  { q: "Which service acts as the foundation for {DESC} in the AWS ecosystem?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is the foundational service for {DESC}." },
  { q: "When designing an architecture that requires {FEATURE}, you should integrate:", a: "{NAME}", fake: "{NAME}", exp: "Integration of {NAME} is essential when {FEATURE} is required." },
  { q: "Which AWS offering is synonymous with '{DESC}'?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is the industry standard in AWS for {DESC}." },
  { q: "For a workload demanding {FEATURE}, the optimal AWS service is:", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is optimized for workloads requiring {FEATURE}." },
  { q: "What is a key capability of {NAME}?", a: "{FEATURE}", fake: "{FEATURE}", exp: "A core capability of {NAME} is {FEATURE}." },
  { q: "Which service reduces the overhead of {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} abstracts the complexity of {DESC}." },
  { q: "A security audit requires {FEATURE}. Which service fulfills this?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} provides the necessary tools for {FEATURE}." },
  { q: "Which service is categorized under {DESC} in the AWS Management Console?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} falls under the {DESC} category." },
  { q: "To build a highly decoupled architecture using {DESC}, you would use:", a: "{NAME}", fake: "{NAME}", exp: "Decoupling is achieved using {DESC} via {NAME}." },
  { q: "Which service is globally distributed and provides {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is a global service offering {FEATURE}." },
  { q: "What service should be provisioned to handle {DESC} automatically?", a: "{NAME}", fake: "{NAME}", exp: "Automatic handling of {DESC} is a feature of {NAME}." },
  { q: "Which AWS service is explicitly built to deliver {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} was built from the ground up for {FEATURE}." },
  { q: "In a cloud migration strategy, {DESC} is typically handled by:", a: "{NAME}", fake: "{NAME}", exp: "Migration strategies use {NAME} for {DESC}." }
];

// === GITHUB DATA ===
const gitHubEntities = [
  { name: "GitHub Actions", desc: "CI/CD Automation Platform", feature: "automating software workflows directly in the repository" },
  { name: "Pull Requests", desc: "Code Review Mechanism", feature: "proposing and collaborating on code changes" },
  { name: "Forking", desc: "Repository Duplication", feature: "creating a personal copy of someone else's project" },
  { name: "GitHub Issues", desc: "Bug and Task Tracking", feature: "managing bugs, enhancements, and project tasks" },
  { name: "GitHub Pages", desc: "Static Website Hosting", feature: "hosting websites directly from a repository" },
  { name: "Dependabot", desc: "Dependency Management Security", feature: "automatically updating vulnerable dependencies" },
  { name: "GitHub Copilot", desc: "AI Pair Programmer", feature: "suggesting code snippets and entire functions in real-time" },
  { name: "GitHub Codespaces", desc: "Cloud Development Environments", feature: "providing a complete VS Code environment in the browser" },
  { name: "git push", desc: "Remote Upload Command", feature: "uploading local repository commits to a remote repository" },
  { name: "git clone", desc: "Repository Download Command", feature: "downloading a remote repository to your local machine" },
  { name: "git commit", desc: "Version Save Command", feature: "saving staged changes to the local repository history" },
  { name: "git merge", desc: "Branch Integration Command", feature: "combining the changes from one branch into another" },
  { name: "git rebase", desc: "Commit History Rewriting", feature: "moving or combining a sequence of commits to a new base commit" },
  { name: "git stash", desc: "Temporary Change Storage", feature: "shelving uncommitted changes to work on a different branch" },
  { name: "GitHub Wiki", desc: "Project Documentation Hosting", feature: "hosting detailed documentation separate from the codebase" },
  { name: "GitHub Packages", desc: "Software Package Hosting", feature: "publishing and consuming software packages securely" },
  { name: "git checkout -b", desc: "Branch Creation Command", feature: "creating a new branch and immediately switching to it" },
  { name: "git fetch", desc: "Remote Data Retrieval", feature: "downloading objects and refs from another repository without merging" },
  { name: "git log", desc: "History Viewing Command", feature: "showing the commit logs for the repository" },
  { name: "GitHub Discussions", desc: "Community Forum Feature", feature: "hosting conversational threads for project communities" },
  { name: "GitHub Sponsors", desc: "Developer Funding Platform", feature: "financially supporting open source developers and projects" },
  { name: "git reset --hard", desc: "Destructive Revert Command", feature: "discarding all uncommitted changes completely" },
  { name: "git cherry-pick", desc: "Specific Commit Application", feature: "applying the changes introduced by some existing commits" },
  { name: "GitHub Environments", desc: "Deployment Protection", feature: "configuring rules and secrets for specific deployment targets" },
  { name: "GitHub Secrets", desc: "Encrypted Variables", feature: "storing sensitive information like API keys securely" }
];

const gitHubTemplates = [
  { q: "Which feature in GitHub is known as a '{DESC}'?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} serves as the primary tool for {DESC}." },
  { q: "To accomplish {FEATURE} in GitHub, you should use:", a: "{NAME}", fake: "{NAME}", exp: "Using {NAME} is the standard method for {FEATURE}." },
  { q: "What is the primary purpose of {NAME}?", a: "{DESC}", fake: "{DESC}", exp: "{NAME} was created specifically for {DESC}." },
  { q: "If a developer needs to start {FEATURE}, which tool/command is best?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} directly handles {FEATURE}." },
  { q: "Which of the following describes the functionality of {NAME}?", a: "It allows {FEATURE}", fake: "It allows {FEATURE}", exp: "{NAME}'s main functionality is that it allows {FEATURE}." },
  { q: "In a collaborative workflow, {DESC} is managed by:", a: "{NAME}", fake: "{NAME}", exp: "Collaboration relies heavily on {NAME} for {DESC}." },
  { q: "What is the result of using {NAME}?", a: "It enables {FEATURE}", fake: "It enables {FEATURE}", exp: "The direct result of {NAME} is {FEATURE}." },
  { q: "Which feature/command abstracts the complexity of {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} simplifies the process of {DESC}." },
  { q: "When you require {FEATURE}, the best GitHub native feature is:", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is built-in to support {FEATURE}." },
  { q: "Which tool is synonymous with '{DESC}' on the GitHub platform?", a: "{NAME}", fake: "{NAME}", exp: "On GitHub, {DESC} is synonymous with {NAME}." },
  { q: "For a repository requiring {FEATURE}, you should enable:", a: "{NAME}", fake: "{NAME}", exp: "Enabling {NAME} gives you access to {FEATURE}." },
  { q: "What is a core benefit of utilizing {NAME}?", a: "{FEATURE}", fake: "{FEATURE}", exp: "The primary benefit of {NAME} is {FEATURE}." },
  { q: "Which mechanism provides {DESC} without leaving the GitHub UI?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is fully integrated into the GitHub UI for {DESC}." },
  { q: "A project manager tracking {FEATURE} would most likely use:", a: "{NAME}", fake: "{NAME}", exp: "{NAME} provides robust tools for {FEATURE}." },
  { q: "Which command/feature is strictly used for {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "The strict use-case for {NAME} is {DESC}." },
  { q: "To safely implement {FEATURE}, GitHub recommends using:", a: "{NAME}", fake: "{NAME}", exp: "GitHub best practices recommend {NAME} for {FEATURE}." },
  { q: "Which of these is a global Git command or GitHub feature that provides {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is the global standard for {FEATURE}." },
  { q: "What should a developer use to trigger {DESC} automatically?", a: "{NAME}", fake: "{NAME}", exp: "Automatic {DESC} is triggered via {NAME}." },
  { q: "Which feature was introduced by GitHub specifically for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "GitHub introduced {NAME} to solve the need for {FEATURE}." },
  { q: "In open-source development, {DESC} is predominantly facilitated by:", a: "{NAME}", fake: "{NAME}", exp: "Open source relies heavily on {NAME} for {DESC}." }
];

// === GITLAB DATA ===
const gitLabEntities = [
  { name: ".gitlab-ci.yml", desc: "Pipeline Configuration File", feature: "defining the structure and order of CI/CD jobs" },
  { name: "GitLab Runner", desc: "Job Execution Agent", feature: "running pipeline jobs and sending results back to GitLab" },
  { name: "Merge Request", desc: "Code Integration Proposal", feature: "requesting to merge one branch into another" },
  { name: "GitLab Auto DevOps", desc: "Automated CI/CD Templates", feature: "automatically detecting, building, testing, and deploying applications" },
  { name: "GitLab Container Registry", desc: "Docker Image Storage", feature: "securely storing and managing custom Docker images" },
  { name: "Pipeline Artifacts", desc: "Job Output Files", feature: "passing files between pipeline stages or keeping them for download" },
  { name: "GitLab Boards", desc: "Agile Project Management", feature: "visualizing issue workflows using Kanban-style boards" },
  { name: "GitLab Epics", desc: "Portfolio Level Planning", feature: "grouping related issues together across different projects" },
  { name: "GitLab Pages", desc: "Static Site Hosting", feature: "publishing static websites directly from a repository" },
  { name: "GitLab Environments", desc: "Deployment Tracking", feature: "tracking where code is deployed (e.g., staging, production)" },
  { name: "GitLab Snippets", desc: "Code Sharing Feature", feature: "storing and sharing small bits of code or text" },
  { name: "GitLab Value Stream Analytics", desc: "Workflow Metrics", feature: "measuring the time taken to go from an idea to production" },
  { name: "GitLab Security Scanning", desc: "Vulnerability Detection", feature: "automatically checking code for SAST, DAST, and dependency vulnerabilities" },
  { name: "GitLab Geo", desc: "Distributed Repository Cloning", feature: "providing local, read-only replicas of a GitLab instance" },
  { name: "Pipeline Stages", desc: "Logical Job Groupings", feature: "defining when jobs run (e.g., build, test, deploy)" },
  { name: "GitLab Code Owners", desc: "Approval Requirement Tool", feature: "defining who owns specific files and requiring their approval on MRs" },
  { name: "GitLab Web IDE", desc: "In-Browser Editor", feature: "editing files and committing changes without a local Git environment" },
  { name: "GitLab Review Apps", desc: "Dynamic Environment Generation", feature: "providing a live environment for every Merge Request to preview changes" },
  { name: "GitLab Runners Tags", desc: "Job Routing Mechanism", feature: "ensuring specific jobs run on designated runners with specific capabilities" },
  { name: "GitLab Feature Flags", desc: "Toggle Management", feature: "deploying features safely by toggling them on or off in production" },
  { name: "GitLab CI Variables", desc: "Dynamic Value Injection", feature: "passing secrets and dynamic configurations into pipelines" },
  { name: "GitLab Scheduled Pipelines", desc: "Cron-based Execution", feature: "running specific pipelines at regular intervals automatically" },
  { name: "GitLab Dependency Proxy", desc: "Image Caching", feature: "caching upstream Docker images to speed up pipeline execution" },
  { name: "GitLab Releases", desc: "Software Snapshotting", feature: "packaging source code and build artifacts into a point-in-time release" },
  { name: "GitLab Service Desk", desc: "External Issue Management", feature: "allowing external users to create issues via email" }
];

const gitLabTemplates = [
  { q: "In GitLab, what is the primary function of {NAME}?", a: "It provides {DESC}", fake: "It provides {DESC}", exp: "{NAME} is used because it provides {DESC}." },
  { q: "Which GitLab feature is strictly responsible for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} handles the responsibility of {FEATURE}." },
  { q: "To implement {DESC} in a GitLab project, you would rely on:", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is the native GitLab tool for {DESC}." },
  { q: "What does {NAME} uniquely offer in the GitLab ecosystem?", a: "{FEATURE}", fake: "{FEATURE}", exp: "{NAME} offers {FEATURE} to enhance development." },
  { q: "Which component is essential for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "Without {NAME}, {FEATURE} cannot be achieved." },
  { q: "A DevOps engineer needs {DESC}. Which GitLab tool should they configure?", a: "{NAME}", fake: "{NAME}", exp: "Configuring {NAME} solves the need for {DESC}." },
  { q: "What is the result of properly configuring {NAME}?", a: "It enables {FEATURE}", fake: "It enables {FEATURE}", exp: "Proper configuration of {NAME} enables {FEATURE}." },
  { q: "Which feature is synonymous with '{DESC}' within GitLab?", a: "{NAME}", fake: "{NAME}", exp: "Within GitLab, {DESC} is synonymous with {NAME}." },
  { q: "For a pipeline requiring {FEATURE}, you must utilize:", a: "{NAME}", fake: "{NAME}", exp: "Pipelines utilize {NAME} for {FEATURE}." },
  { q: "What is a core benefit of adopting {NAME}?", a: "{FEATURE}", fake: "{FEATURE}", exp: "Adopting {NAME} provides the benefit of {FEATURE}." },
  { q: "Which GitLab mechanism abstracts the complexity of {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} simplifies {DESC}." },
  { q: "A project manager tracking {FEATURE} would most likely use:", a: "{NAME}", fake: "{NAME}", exp: "{NAME} provides robust tools for {FEATURE}." },
  { q: "Which GitLab component is specifically designed for {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is specifically designed for {DESC}." },
  { q: "To safely manage {FEATURE}, GitLab recommends using:", a: "{NAME}", fake: "{NAME}", exp: "GitLab best practices recommend {NAME} for {FEATURE}." },
  { q: "Which of these provides {FEATURE} across the entire GitLab lifecycle?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} integrates deeply to provide {FEATURE}." },
  { q: "What should a developer use to trigger {DESC} automatically?", a: "{NAME}", fake: "{NAME}", exp: "Automatic {DESC} is triggered via {NAME}." },
  { q: "Which feature was built into GitLab specifically for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "GitLab built {NAME} to solve the need for {FEATURE}." },
  { q: "In a fully integrated DevOps workflow, {DESC} is facilitated by:", a: "{NAME}", fake: "{NAME}", exp: "Integrated workflows rely on {NAME} for {DESC}." },
  { q: "What is the defining characteristic of {NAME}?", a: "{DESC}", fake: "{DESC}", exp: "The defining characteristic of {NAME} is {DESC}." },
  { q: "Which GitLab feature minimizes the friction of {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} removes friction by automating {FEATURE}." }
];

// === GEN AI DATA ===
const genAiEntities = [
  { name: "Transformer Architecture", desc: "Attention-based Neural Network", feature: "highly parallelizable self-attention mechanisms" },
  { name: "Retrieval-Augmented Generation (RAG)", desc: "Context Injection Technique", feature: "grounding model responses in external, real-time knowledge" },
  { name: "Temperature", desc: "Randomness Parameter", feature: "controlling the creativity and determinism of generated text" },
  { name: "Zero-shot Prompting", desc: "No-Example Inference", feature: "asking a model to perform a task without providing any examples" },
  { name: "Hallucination", desc: "Factual Fabrication", feature: "generating plausible-sounding but factually incorrect information" },
  { name: "LoRA (Low-Rank Adaptation)", desc: "Parameter-Efficient Fine-Tuning", feature: "injecting trainable rank decomposition matrices while freezing pre-trained weights" },
  { name: "Tokenization", desc: "Text Chunking Process", feature: "breaking text down into subwords or words for the model to process" },
  { name: "RLHF", desc: "Alignment Technique", feature: "Reinforcement Learning from Human Feedback to align models with human values" },
  { name: "Context Window", desc: "Input Memory Limit", feature: "determining the maximum number of tokens a model can process simultaneously" },
  { name: "Few-shot Prompting", desc: "Example-based Inference", feature: "providing a small number of examples in the prompt to teach a pattern" },
  { name: "Diffusion Models", desc: "Image Generation Architecture", feature: "generating high-quality images by reversing a noise-addition process" },
  { name: "Vector Database", desc: "Embedding Storage", feature: "storing high-dimensional embeddings for efficient semantic similarity searches" },
  { name: "Embeddings", desc: "Numerical Representations", feature: "converting words and sentences into mathematical vectors that capture meaning" },
  { name: "Fine-tuning", desc: "Model Adaptation", feature: "training a pre-trained model on a smaller, domain-specific dataset" },
  { name: "Prompt Engineering", desc: "Input Optimization", feature: "crafting inputs carefully to extract the most accurate response from an LLM" },
  { name: "Generative Adversarial Networks (GANs)", desc: "Dual Neural Network Setup", feature: "using a generator and discriminator network competing against each other" },
  { name: "Self-Attention", desc: "Weighting Mechanism", feature: "allowing a model to weigh the importance of different words in a sentence relative to each other" },
  { name: "Chain-of-Thought Prompting", desc: "Reasoning Technique", feature: "forcing the model to break down complex problems into step-by-step intermediate steps" },
  { name: "Quantization", desc: "Model Compression", feature: "reducing the precision of model weights (e.g., to 8-bit) to save VRAM and increase speed" },
  { name: "Overfitting", desc: "Training Error", feature: "when a model learns the training data too well and performs poorly on new data" },
  { name: "Latent Space", desc: "Compressed Representation", feature: "the mathematical space where models map representations of complex data" },
  { name: "Perplexity", desc: "Evaluation Metric", feature: "measuring how well a probability distribution predicts a sample (lower is better)" },
  { name: "Multimodal AI", desc: "Cross-format Processing", feature: "understanding and generating combinations of text, images, and audio" },
  { name: "System Prompt", desc: "Behavioral Instruction", feature: "the initial instruction that sets the persona, rules, and boundaries for an LLM" },
  { name: "Top-P (Nucleus Sampling)", desc: "Token Selection Method", feature: "filtering the next token choices based on cumulative probability" }
];

const genAiTemplates = [
  { q: "In Generative AI, what is {NAME} best described as?", a: "{DESC}", fake: "{DESC}", exp: "{NAME} is fundamentally a {DESC}." },
  { q: "Which concept is responsible for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is the exact mechanism that enables {FEATURE}." },
  { q: "To achieve {DESC}, AI researchers rely on:", a: "{NAME}", fake: "{NAME}", exp: "AI relies heavily on {NAME} to achieve {DESC}." },
  { q: "What does {NAME} uniquely offer in the field of LLMs?", a: "{FEATURE}", fake: "{FEATURE}", exp: "{NAME} revolutionized LLMs by offering {FEATURE}." },
  { q: "Which component is essential for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "Without {NAME}, {FEATURE} cannot be effectively achieved." },
  { q: "An AI engineer needs {DESC}. Which technique/concept should they apply?", a: "{NAME}", fake: "{NAME}", exp: "Applying {NAME} solves the need for {DESC}." },
  { q: "What is the result of properly utilizing {NAME}?", a: "It enables {FEATURE}", fake: "It enables {FEATURE}", exp: "Proper utilization of {NAME} enables {FEATURE}." },
  { q: "Which concept is synonymous with '{DESC}' within modern AI?", a: "{NAME}", fake: "{NAME}", exp: "Within AI, {DESC} is synonymous with {NAME}." },
  { q: "For a system requiring {FEATURE}, you must utilize:", a: "{NAME}", fake: "{NAME}", exp: "Modern AI systems utilize {NAME} for {FEATURE}." },
  { q: "What is a core benefit of adopting {NAME}?", a: "{FEATURE}", fake: "{FEATURE}", exp: "Adopting {NAME} provides the primary benefit of {FEATURE}." },
  { q: "Which AI mechanism abstracts the complexity of {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} simplifies and manages {DESC}." },
  { q: "A prompt engineer aiming for {FEATURE} would most likely use:", a: "{NAME}", fake: "{NAME}", exp: "{NAME} provides robust tools for {FEATURE}." },
  { q: "Which AI component is specifically designed for {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} is specifically architected for {DESC}." },
  { q: "To safely manage {FEATURE}, industry standards recommend using:", a: "{NAME}", fake: "{NAME}", exp: "Industry standards recommend {NAME} for {FEATURE}." },
  { q: "Which of these provides {FEATURE} across the entire model inference lifecycle?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} integrates deeply to provide {FEATURE}." },
  { q: "What should a developer adjust or use to trigger {DESC}?", a: "{NAME}", fake: "{NAME}", exp: "Adjusting {NAME} triggers {DESC}." },
  { q: "Which architecture/technique was built specifically for {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} was built from the ground up to solve the need for {FEATURE}." },
  { q: "In a fully integrated RAG workflow, {DESC} is facilitated by:", a: "{NAME}", fake: "{NAME}", exp: "RAG workflows rely heavily on {NAME} for {DESC}." },
  { q: "What is the defining characteristic of {NAME}?", a: "{DESC}", fake: "{DESC}", exp: "The defining characteristic of {NAME} is {DESC}." },
  { q: "Which AI feature minimizes the friction of {FEATURE}?", a: "{NAME}", fake: "{NAME}", exp: "{NAME} removes friction by automating {FEATURE}." }
];

function main() {
  console.log("==================================================");
  console.log("🚀 Starting Procedural Offline Question Generator");
  console.log("==================================================");
  
  const awsQuestions = generateCategoryQuestions("AWS", awsTemplates, awsEntities, 500);
  console.log(`✅ Generated ${awsQuestions.length} unique questions for AWS`);
  
  const githubQuestions = generateCategoryQuestions("GitHub", gitHubTemplates, gitHubEntities, 500);
  console.log(`✅ Generated ${githubQuestions.length} unique questions for GitHub`);
  
  const gitlabQuestions = generateCategoryQuestions("GitLab", gitLabTemplates, gitLabEntities, 500);
  console.log(`✅ Generated ${gitlabQuestions.length} unique questions for GitLab`);
  
  const genaiQuestions = generateCategoryQuestions("Gen AI", genAiTemplates, genAiEntities, 500);
  console.log(`✅ Generated ${genaiQuestions.length} unique questions for Gen AI`);

  const allQuestions = [...awsQuestions, ...githubQuestions, ...gitlabQuestions, ...genaiQuestions];
  
  const fileContent = `export const quizQuestions = ${JSON.stringify(allQuestions, null, 2)};`;
  fs.writeFileSync(OUTPUT_FILE, fileContent);
  
  console.log("==================================================");
  console.log(`🎉 SUCCESS! Successfully wrote exactly ${allQuestions.length} unique questions to src/data/questions.js!`);
  console.log("==================================================");
}

main();
