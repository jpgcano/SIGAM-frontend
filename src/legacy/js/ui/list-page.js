// List page with pagination helpers.
(function () {
  const BasePage = window.SIGAM_UI && window.SIGAM_UI.BasePage;

  class ListPage extends BasePage {
    constructor(root) {
      super(root);
      this.currentPage = 1;
      this.pageSize = 20;
      this.hasMore = false;
    }

    updatePagination({ pageInfo, prevBtn, nextBtn }) {
      if (pageInfo) {
        pageInfo.textContent = `Page ${this.currentPage}`;
      }
      if (prevBtn) {
        prevBtn.disabled = this.currentPage <= 1;
      }
      if (nextBtn) {
        nextBtn.disabled = !this.hasMore;
      }
    }
  }

  window.SIGAM_UI = window.SIGAM_UI || {};
  window.SIGAM_UI.ListPage = ListPage;
})();
