function save_options() {
  chrome.storage.sync.set({
    selected_format: document.getElementById('format').value,
    summary_check: document.getElementById("summary_check").checked,
    abstract_check: document.getElementById("abstract_check").checked,
    author_check: document.getElementById("author_check").checked,
    journal_check: document.getElementById("journal_check").checked,
    subject_check: document.getElementById("subject_check").checked,
    comment_check: document.getElementById("comment_check").checked,
    link_check: document.getElementById("link_check").checked,
    summary_text: document.getElementById("summary_text").value,
    abstract_text: document.getElementById("abstract_text").value,
    author_text: document.getElementById("author_text").value,
    journal_text: document.getElementById("journal_text").value,
    subject_text: document.getElementById("subject_text").value,
    comment_text: document.getElementById("comment_text").value,
    link_text: document.getElementById("link_text").value
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Status: Options saved.';
    setTimeout(function() {
      status.textContent = 'Status: ';
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    selected_format: 'github',
    summary_check: Boolean("true"),
    abstract_check: Boolean("true"),
    author_check: Boolean("true"),
    journal_check: Boolean("true"),
    subject_check: Boolean("true"),
    comment_check: Boolean("true"),
    link_check: Boolean("true"),
    summary_text: "Summary",
    abstract_text: "Abstract",
    author_text: "Author",
    journal_text: "Journal/Conference",
    subject_text: "Subjects",
    comment_text: "Comment",
    link_text: "Link",
  }, function(items) {
    document.getElementById('format').value = items.selected_format;
    document.getElementById("summary_check").checked = items.summary_check;
    document.getElementById("abstract_check").checked = items.abstract_check;
    document.getElementById("author_check").checked = items.author_check;
    document.getElementById("journal_check").checked = items.journal_check;
    document.getElementById("subject_check").checked = items.subject_check;
    document.getElementById("comment_check").checked = items.comment_check;
    document.getElementById("link_check").checked = items.link_check;
    document.getElementById("summary_text").value = items.summary_text;
    document.getElementById("abstract_text").value = items.abstract_text;
    document.getElementById("author_text").value = items.author_text;
    document.getElementById("journal_text").value = items.journal_text;
    document.getElementById("subject_text").value = items.subject_text;
    document.getElementById("comment_text").value = items.comment_text;
    document.getElementById("link_text").value = items.link_text;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
