// Copy button functionality - copies Bazi result
document.getElementById('copyBtn').onclick = function() {
  const baziResult = getCurrentBazi();
  
  navigator.clipboard.writeText(baziResult);

  const originalText = this.textContent;
  this.textContent = '✅';
  setTimeout(() => {
    this.textContent = originalText;
  }, 1000);
};

// Initialize calendar when page loads
initCalendar();
