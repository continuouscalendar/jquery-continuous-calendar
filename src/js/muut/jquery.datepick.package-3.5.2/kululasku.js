$(function() {
  loadContactInfo();
  initRadioEvents();
  createReceiptRows();
  initEuroAmountEvents();
  initMailSendingEvent();
  initBillIdEvents();
  initEnterBehavior();
});
function initEnterBehavior() {
  var textboxes = $("input");
  if ($.browser.mozilla) {
    $(textboxes).keypress(checkForEnter);
  } else {
    $(textboxes).keydown(checkForEnter);
  }
  function checkForEnter(event) {
    if (event.keyCode == 13) {
      var currentBoxNumber = textboxes.index(this);
      var nextBox = textboxes[currentBoxNumber + 1];
      if (nextBox != null) {
        nextBox.focus();
        nextBox.select();
      }
      event.preventDefault();
      return false;
    }
    return true;
  }
}
function initRadioEvents() {
  $("#customerName").focus(function() {
    $("#yes").click();
  }).keyup(updateEmailSubject);
}
function createReceiptRows() {
  var receiptRowHtml = $.trim($("table tbody").html());
  for (var i = 2; i <= 20; i++) $("table tbody").append(receiptRowHtml.replace(/>1</, ">" + i + "<"));
  $("table tbody tr:odd").addClass("odd");
}
function initEuroAmountEvents() {
  $(".euroAmount").keyup(function() {
    var euroTotal = $(".euroAmount").map(parseEuroValue).sum();
    $("#euroTotal").text(euroTotal).format({format:"#,###.00", locale:"fr"});
    updateValidationStatus(this);
  });
}
function initMailSendingEvent() {
  $("#mailTo").click(function() {
    saveContactInfo();
    email.billOfServices();
    return false;
  });
}
function initBillIdEvents() {
  $("#userName").keyup(function() {
    updateBillId();
    updateEmailSubject();
  });
}

var email = {
  billOfServices: function() {
    $.post("mail.php",{
      to: this.to(),
      from: this.cc(),
      userName: this.userName(),
      subject: this.subject(),
      body: this.message()
    },
    function() {
      $("#sendStatus").html("Sähköposti lähetetty.");
    });
  },
  to: function() { return "laskutus@ri.fi"; },
  cc: function () { return $("#emailAddress").val(); },
  userName: function() { return $("#userName").val(); },
  subject: function() { return "Kululasku / " + $("#userName").val() + " / " + currentDate() + " / " + $("#customerName").val(); },
  message: function() { return  [this.chargeFromCustomer(), "", this.receipts().join("\n"), " ", this.euroTotal(), " ", this.letterInformation(), " ", this.bankAccount()].join("\n"); },
  euroTotal: function() { return "\t Yhteensä \t " + $("#euroTotal").text() + " \t EUR"; },
  bankAccount: function() { return "Tilinumero: " + $("#bankAccountNumber").val(); },
  chargeFromCustomer: function() {
    if($("#dontKnow").attr("checked")) return $("label[for=dontKnow]").text();
    if($("#no").attr("checked")) return "Ei laskuteta asiakkaalta.";
    if($("#flexi").attr("checked")) return "Laskutetaan Mehukenraali- tai ITEA2 Flexi -projektilta.";
    if($("#yes").attr("checked")) return "Laskutetaan asiakkaalta " + $("#customerName").val() + ".";
  },
  receipts: function() {
    function formatReceipt(elem, i) {
      var row = $(elem);
      var description = row.find(".description").val();
      var euroAmount = row.find(".euroAmount").val().replace(/\./,",");
      if (description == "" && euroAmount == "") return null;
      return [(i + 1), description, euroAmount, "EUR"].join(" \t ");
    }
    return $.map($("table tbody tr"), formatReceipt);
  },
  letterInformation: function() {
    return "Kuitit tulevat kirjekuoressa toimistolle. Kuitit on numeroitu. Kuoressa lukee\n\n" + this.letterCover();
  },
  letterCover: function() {
    return $.trim($("#letterCover div").text()).replace(/\n */g, "\n");
  }
};

function saveContactInfo() {
  setCookie("userName",$("#userName").val());
  setCookie("emailAddress",$("#emailAddress").val());
  setCookie("bankAccountNumber",$("#bankAccountNumber").val());
}
function loadContactInfo() {
  $("#userName").val($.cookie("userName"));
  $("#emailAddress").val($.cookie("emailAddress"));
  $("#bankAccountNumber").val($.cookie("bankAccountNumber"));
  updateBillId();
  updateEmailSubject();
}
function updateBillId() {
  $("#billId").text($("#userName").val() + " / " + currentDate());
}
function updateEmailSubject() {
  $("#emailSubject").text(email.subject());
}
function currentDate() {
  return new Date().format("dd.mm.yyyy");
}
function updateValidationStatus(elem) {
  if (isNaN(fieldValAsNumber(elem))) {
    $(elem).addClass("invalidInput");
  } else {
    $(elem).removeClass("invalidInput");
  }
}
function parseEuroValue(i, elem) {
  var euroValue = parseFloat(fieldValAsNumber(elem));
  return isNaN(euroValue) ? 0 : euroValue;
}
function fieldValAsNumber(elem) {
  return elem.value.replace(/,/,".").replace(/ /,"");
}
$.fn.sum = function() {
  var sum = 0;
  this.each(function() { sum += this; });
  return sum;
};
function setCookie(name, value) {
  $.cookie(name,value, { expires: 3 * 365 });
}