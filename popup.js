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
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

function get_list_prefix(items){
 switch(items.selected_format){
    case "github":
      return "-";
    case "scrapbox":
      return " ";
    default:
      return "-";
  }
}

function set_title(info, text, items){
  switch(items.selected_format){
    case "github":
      return [info, "## " + text + "\n"].join("\n");
    case "scrapbox":
      return [info, "[** " + text + "]\n"].join("\n");
    default:
      return [info, "## " + text + "\n"].join("\n");
  }
}

function set_summary(info, items){
  if(!items.summary_check) return info;
  return set_title(info, items.summary_text, items);
}

function set_abstract(info, items, dom){
  if(!items.abstract_check) return info;
  info = set_title(info, items.abstract_text, items);
  abstract = dom.find("blockquote.abstract.mathjax").text();
  abstract = abstract.split("Abstract:  ")[1];
  abstract = abstract.replace(/\r?\n/g, '');
  return [info, abstract + "\n"].join('\n');
}

function separate_authors(authors, items){
  ary = authors.split(", ");
  text = "";
  ary.forEach(function(author){
    text += get_list_prefix(items) + " " + author + "\n";
  });
  return text;
}

function set_author(info, items, dom){
  if(!items.author_check) return info;
  info = set_title(info, items.author_text, items);
  authors = dom.find('div.authors')["0"].innerHTML.split("Authors:")[1];
  authors = authors.replace(/\n/g, '');
  authors = separate_authors(authors, items);
  return [info, authors].join('\n');
}

function set_journal(info, items, dom){
  if(!items.journal_check) return info;
  info = set_title(info, items.journal_text, items);
  journal = dom.find('div.metatable').find(".jref").text();
  if(journal != '' && journal != undefined && journal.length != 0){
    info = [info, journal].join('\n');
  }else{
    info += "\n";
  }
  info += "\n";
  return info;
}

function separate_subjects(subjects, items){
  ary = subjects.split("; ");
  text = "";
  ary.forEach(function(subject){
    names = subject.split(" (");
    name = names[0];
    extension = names[1].replace(")", "");
    text += get_list_prefix(items) + " `" + extension + "`: " + name + "\n";
  });
  return text;
}

function set_subject(info, items, dom){
  if(!items.subject_check) return info;
  info = set_title(info, items.subject_text, items);
  subjects = dom.find('div.metatable').find('.subjects').text();
  if(subjects == '' || subjects == undefined || subjects.length == 0) return info;
  subjects = separate_subjects(subjects.trim(), items);
  return [info, subjects].join('\n');
}

function set_comment(info, items, dom){
  if(!items.comment_check) return info;
  info = set_title(info, items.comment_text, items);
  comment = dom.find('div.metatable').find('.comments');
  if(comment == '' || comment == undefined || comment.length == 0) return info;
  comment = comment["0"].innerHTML;
  return [info, comment + "\n"].join('\n');
}

function set_link(info, items, url){
  if(!items.link_check) return info;
  info = set_title(info, items.link_text, items);
  return [info, get_list_prefix(items) + " arXiv: " + url + "\n"].join('\n');
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    chrome.tabs.executeScript({
      code: '(' + modifyDOM + ')();'
    }, (results) => {
      var $dom = $($.parseHTML(results[0]));
      info = "";
      chrome.storage.sync.get(null, function(items){
        info = set_summary(info, items);
        info = set_abstract(info, items, $dom);
        info = set_author(info, items, $dom);
        info = set_journal(info, items, $dom);
        info = set_subject(info, items, $dom);
        info = set_comment(info, items, $dom);
        info = set_link(info, items, url);
        copyToClipboard(info);
        $('#result').text('Copied!');
        setTimeout(function () {
          window.close();
        }, 1000);
      });
    });
  });
});
