// Import required dependencies
import { Octokit } from '@octokit/rest';

/**
 * Answers questions about GitHub repositories and provides insights.
 * @param {Object} params - The parameters for the function
 * @param {string} params.owner - GitHub repository owner
 * @param {string} params.repo - GitHub repository name
 * @param {string} params.question - The question about the repository
 * @param {string} [params.context] - Additional context for the question
 * @param {Object} userSettings - User settings containing GitHub token
 * @param {string} userSettings.githubToken - GitHub Personal Access Token
 * @returns {Promise<Object>} Answer and related information
 */
async function answer_repository_question(params, userSettings) {
  const { owner, repo, question, context } = params;
  const { githubToken } = userSettings;

  if (!githubToken) {
    throw new Error('GitHub token is required');
  }

  try {
    const octokit = new Octokit({ auth: githubToken });
    const repoInfo = await getRepositoryInfo(octokit, owner, repo);
    const answer = await generateAnswer(octokit, repoInfo, question, context);
    return answer;
  } catch (error) {
    throw new Error(`Failed to answer question: ${error.message}`);
  }
}

/**
 * Gets repository information from GitHub
 * @param {Octokit} octokit - GitHub API client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository information
 */
async function getRepositoryInfo(octokit, owner, repo) {
  const { data: repoData } = await octokit.repos.get({
    owner,
    repo
  });

  const { data: languages } = await octokit.repos.listLanguages({
    owner,
    repo
  });

  const { data: topics } = await octokit.repos.getAllTopics({
    owner,
    repo
  });

  return {
    ...repoData,
    languages,
    topics: topics.names
  };
}

/**
 * Generates an answer based on repository information and question
 * @param {Octokit} octokit - GitHub API client
 * @param {Object} repoInfo - Repository information
 * @param {string} question - User's question
 * @param {string} [context] - Additional context
 * @returns {Promise<Object>} Answer and related information
 */
async function generateAnswer(octokit, repoInfo, question, context) {
  const answer = {
    text: '',
    relatedFiles: [],
    suggestions: []
  };

  // Analyze question type
  const questionType = analyzeQuestionType(question);

  switch (questionType) {
    case 'general':
      answer.text = generateGeneralAnswer(repoInfo, question);
      break;
    case 'technical':
      const { text, files } = await findTechnicalAnswer(octokit, repoInfo, question);
      answer.text = text;
      answer.relatedFiles = files;
      break;
    case 'statistics':
      answer.text = generateStatisticsAnswer(repoInfo, question);
      break;
    default:
      answer.text = 'I apologize, but I cannot understand the question type.';
  }

  // Add suggestions if applicable
  if (context) {
    answer.suggestions = generateSuggestions(repoInfo, question, context);
  }

  return answer;
}

/**
 * Analyzes the type of question being asked
 * @param {string} question - User's question
 * @returns {string} Question type: 'general', 'technical', or 'statistics'
 */
function analyzeQuestionType(question) {
  const technicalKeywords = ['how', 'implement', 'code', 'function', 'class', 'method'];
  const statisticsKeywords = ['many', 'count', 'size', 'number', 'statistics'];

  question = question.toLowerCase();

  if (technicalKeywords.some(keyword => question.includes(keyword))) {
    return 'technical';
  }
  if (statisticsKeywords.some(keyword => question.includes(keyword))) {
    return 'statistics';
  }
  return 'general';
}

/**
 * Generates answer for general questions about the repository
 * @param {Object} repoInfo - Repository information
 * @param {string} question - User's question
 * @returns {string} Generated answer
 */
function generateGeneralAnswer(repoInfo, question) {
  const { description, homepage, topics, language } = repoInfo;
  
  if (question.includes('about')) {
    return `This repository is ${description || 'a project'} written primarily in ${language}. ${
      homepage ? `You can find more information at ${homepage}.` : ''
    } ${topics.length > 0 ? `It's tagged with the following topics: ${topics.join(', ')}.` : ''}`;
  }
  
  return `I found some general information about the repository: ${description}`;
}

/**
 * Finds answer for technical questions by searching repository content
 * @param {Octokit} octokit - GitHub API client
 * @param {Object} repoInfo - Repository information
 * @param {string} question - User's question
 * @returns {Promise<Object>} Answer text and related files
 */
async function findTechnicalAnswer(octokit, repoInfo, question) {
  const { data: searchResults } = await octokit.search.code({
    q: `${question.replace(/[^\w\s]/g, ' ')} repo:${repoInfo.full_name}`,
    per_page: 5
  });

  const files = searchResults.items.map(item => ({
    name: item.name,
    path: item.path,
    url: item.html_url
  }));

  const text = files.length > 0
    ? `I found some relevant files that might help answer your question:\n\n${
        files.map(f => `- ${f.path} (${f.url})`).join('\n')
      }`
    : 'I could not find any relevant code files for your technical question.';

  return { text, files };
}

/**
 * Generates answer for statistics-related questions
 * @param {Object} repoInfo - Repository information
 * @param {string} question - User's question
 * @returns {string} Generated answer with statistics
 */
function generateStatisticsAnswer(repoInfo, question) {
  const stats = {
    size: repoInfo.size,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    issues: repoInfo.open_issues_count,
    languages: Object.keys(repoInfo.languages).length,
    created: new Date(repoInfo.created_at).toLocaleDateString(),
    updated: new Date(repoInfo.updated_at).toLocaleDateString()
  };

  if (question.includes('language')) {
    return `The repository uses ${stats.languages} languages: ${Object.keys(repoInfo.languages).join(', ')}`;
  }
  if (question.includes('popular') || question.includes('stars')) {
    return `The repository has ${stats.stars} stars and ${stats.forks} forks`;
  }
  if (question.includes('issue')) {
    return `There are currently ${stats.issues} open issues`;
  }

  return `Repository statistics:\n- Size: ${stats.size}KB\n- Stars: ${stats.stars}\n- Forks: ${stats.forks}\n- Open Issues: ${stats.issues}\n- Created: ${stats.created}\n- Last Updated: ${stats.updated}`;
}

/**
 * Generates suggestions based on repository analysis
 * @param {Object} repoInfo - Repository information
 * @param {string} question - User's question
 * @param {string} context - Additional context
 * @returns {Array<string>} List of suggestions
 */
function generateSuggestions(repoInfo, question, context) {
  const suggestions = [];

  if (!repoInfo.description) {
    suggestions.push('Add a repository description to help users understand the project better');
  }
  if (!repoInfo.homepage && !repoInfo.has_pages) {
    suggestions.push('Consider adding a homepage or enabling GitHub Pages');
  }
  if (repoInfo.topics.length === 0) {
    suggestions.push('Add repository topics to improve discoverability');
  }
  if (repoInfo.open_issues_count > 20) {
    suggestions.push('Consider addressing some open issues to improve repository health');
  }

  return suggestions;
}
