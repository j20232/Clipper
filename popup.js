ARXIV_URL = 'https://arxiv.org/abs/*';

function getCurrentTabUrl(callback) {
  var queryInfo = {
    url: ARXIV_URL,
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    if (tabs.length > 0) {
      var tab = tabs[0];
      var url = tab.url;
      console.assert(typeof url == 'string', 'tab.url should be a string');
      callback(url);
    } else {
      $('#result').text('Not abs page!');
    }
  });
}

function modifyDOM() {
  return document.body.innerHTML;
}

function copyToClipboard(text) {
  const input = document.createElement('textarea');
  input.style.position = 'fixed';
  //input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

function separate_authors(authors){
  ary = authors.split(", ");
  text = "";
  ary.forEach(function(author){
    text += "- " + author + "\n";
  });
  return text;
}

function separate_subjects(subjects){
  ary = subjects.split("; ");
  text = "";
  ary.forEach(function(subject){
    names = subject.split(" (");
    name = names[0];
    extension = names[1].replace(")", "");
    text += "- **[" + extension + "]**: " + name + "\n";
  });
  return text;
}

function reshape_abstract(abstract){
  abstract = abstract.split("Abstract:  ")[1];
  abstract = abstract.replace(/\r?\n/g, '');
  return abstract;
}


document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    chrome.tabs.executeScript({
      code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
      var $dom = $($.parseHTML(results[0]));

      // title = $dom.find('h1.title').text().split('Title:')[1];
      info = ["\n## Summary\n\n", "## Abstract [quoted]\n"].join('\n');

      abstract = $dom.find("blockquote.abstract.mathjax").text();
      abstract = reshape_abstract(abstract);
      info = [info, abstract + "\n"].join('\n');

      authors = $dom.find('div.authors').text().split('Authors:')[1];
      authors = authors.replace(/\n/g, '');
      authors = separate_authors(authors);
      info = [info, "## Author\n", authors].join('\n');

      info = [info, "## Journal/Conference"].join('\n');
      journal = $dom.find('div.metatable').find(".jref").text();
      if(journal != '' && journal != undefined && journal.length != 0){
        info = [info, journal].join('\n');
      }else{
        info += "\n";
      }
      info += "\n";

      subjects = $dom.find('div.metatable').find('.subjects').text();
      if(subjects != '' && subjects != undefined && subjects.length != 0){
        subjects = subjects.trim();
        subjects = separate_subjects(subjects);
        info = [info, "## Subjects\n", subjects].join('\n');
      }

      comment = $dom.find('div.metatable').find('.comments');
      if(comment != '' && comment != undefined && comment.length != 0){
        comment = comment["0"].innerHTML;
        info = [info, "## Comment", comment + "\n"].join('\n');
      }

      info = [info, "## Link\n", "- arXiv: " + url].join('\n');

      info += "\n";

      copyToClipboard(info);
      $('#result').text('Copied!');

      // hide popup automatically
      setTimeout(function () {
        window.close();
      }, 300000);
    });
  });
});
