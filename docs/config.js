// GitHub configuration for static deployment
window.GITHUB_CONFIG = {
  token: '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',
  owner: 'moveavelcontent', // Your GitHub username from the URL
  repo: 'MarketplacePay', // Your repository name from the URL
  branch: 'main'
};

// Initialize GitHub storage when page loads
window.addEventListener('DOMContentLoaded', function() {
  if (window.githubStorage) {
    window.githubStorage.initialize().catch(console.error);
  }
});