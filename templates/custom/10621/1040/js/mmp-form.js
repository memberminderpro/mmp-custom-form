// Function to dynamically load the reCAPTCHA script
function loadReCaptchaScript() {
  var script = document.createElement("script");
  script.src =
    "https://www.google.com/recaptcha/api.js?render=" +
    mmpFormOptions.recaptcha_site_key;
  document.head.appendChild(script);
}

// Call the function to load the script
loadReCaptchaScript();

function getQueryParams(qs) {
  let params = new URLSearchParams(qs);
  let result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function preventEnterSubmit(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    return false;
  }
  return true;
}

jQuery(document).ready(function ($) {
  const $emailDiv = $("#EMailDiv");
  const $captchaSend = $(".captcha-send");
  const $consent = $("#Consent");
  const $joinForm = $("#joinForm");
  const $send = $("#Send");

  let $siteEmail = mmpFormOptions.account_email;

  $('input[required], select[required]').each(function () {
    var inputId = $(this).attr("id");
    var label = $('label[for="' + inputId + '"]');
    if (label.length) {
      label.html('<span style="color: red;">*</span> ' + label.html());
    }
  });

  function checkRequiredFields() {
    // Assume all fields are valid initially
    let allFieldsValid = true;

    // Check each input within the form
    $("#joinForm input[required], #joinForm select[required]").each(
      function () {
        if (!$(this).val()) {
          allFieldsValid = false;
          // Break out of the loop if a field is not filled
          return false;
        }
      }
    );

    // Enable or disable the consent checkbox based on field validity
    $consent.prop("disabled", !allFieldsValid);

    // If all fields are valid, remove the 'disabled' class from the sibling label; otherwise, add it back
    if (allFieldsValid) {
      $consent.siblings("label").removeClass("disabled");
    } else {
      $consent.siblings("label").addClass("disabled");
    }
  }

  $("input[required]").on("keyup change paste", function () {
    var $field = $(this);
    if ($field.val() === "") {
      $field.addClass("is-invalid"); // Add class for visual feedback
    } else {
      $field.removeClass("is-invalid"); // Remove class if the field is valid
    }

    checkRequiredFields(); // enable/disable the submit button
  });

  // Function to handle showing/hiding captcha and submit button based on consent
  function toggleCaptchaAndButton() {
    if ($consent.is(":checked")) {
      $captchaSend.show(); // Show captcha
      $send.show().prop("disabled", false); // Show and enable submit button if captcha is solved
    } else {
      $captchaSend.hide(); // Hide captcha and submit button if consent is not checked
      $send.prop("disabled", true);
    }
  }

  // Consent checkbox change event
  $consent.change(function () {
    toggleCaptchaAndButton(); // Call the function to toggle captcha and button based on consent
  });

  $send.click(function (event) {
    event.preventDefault(); // Prevent form submission

    let captchaData = {};
    if ($("[name='g-recaptcha-response']").length > 0) {
      // Google reCAPTCHA is used
      grecaptcha.ready(function () {
        grecaptcha
          .execute(mmpFormOptions.recaptcha_site_key, { action: "submit" })
          .then(function (token) {
            console.log("reCAPTCHA token received:", token);
            captchaData["g-recaptcha-response"] = token;

            verifyCaptchaAndSubmitForm(captchaData);
          });
      });
    } else if ($("[name='h-captcha-response']").length > 0) {
      // hCaptcha is used, assume the hCaptcha response is already in the form
      captchaData["h-captcha-response"] = $(
        "[name='h-captcha-response']"
      ).val();
      verifyCaptchaAndSubmitForm(captchaData);
    } else {
      // No captcha response could mean an error or misconfiguration
      alert(
        "Captcha response is missing. Please ensure captcha is configured correctly."
      );
    }
  });

  function verifyCaptchaAndSubmitForm(captchaData) {
    $.ajax({
      url: "/wp-admin/admin-ajax.php", // WordPress AJAX handler
      type: "POST",
      data: Object.assign(
        {
          action: "verify_and_submit_captcha", // The action hook for the PHP function
        },
        captchaData
      ),
      success: function (response) {
        if (response.success) {
          // Captcha verification succeeded; proceed with form submission
          // Remove captcha response field or modify formData as needed
          $(
            '[name="g-recaptcha-response"], [name="h-captcha-response"]'
          ).remove();

          // Append new fields directly to the form before submission
          $('<input>').attr({
              type: 'hidden',
              name: 'AccountID',
              value: mmpFormOptions.account_ID
          }).appendTo($joinForm);

          $('<input>').attr({
              type: 'hidden',
              name: 'BID',
              value: mmpFormOptions.BID
          }).appendTo($joinForm);

          $('<input>').attr({
              type: 'hidden',
              name: 'AccountEmail',
              value: mmpFormOptions.account_email
          }).appendTo($joinForm);

          // Serialize form data for submission, now excluding the captcha response
          let formData = $joinForm.serialize();

          console.log(formData); // Log the serialized form data
          // Debugger statement acts as a breakpoint if the developer console is open
          debugger;
          
          // Dynamically update the UI with the redirection message
          $("#messageContainer").html(
            "<h4>Thank You!</h4><p>You will now be redirected to our payment gateway in a new window to complete the process. You may safely navigate away from this page or close this tab.</p>"
          );

          // Dynamically update UI or redirect as needed before form submission
          // This part submits the form to the action URL, opening in a new tab/window
          $joinForm.attr("target", "_blank").hide().submit();
        } else {
          // Handle captcha verification failure
          alert("Captcha verification failed. Please try again.");
        }
      },
      error: function (xhr, status, error) {
        // Handle potential AJAX request errors
        alert("An error occurred: " + error);
      },
    });
  }

  $("#Email").change(function () {
    console.log("Handler for email .change() called.");
    $.ajax({
      url: "https://www.emembersdb.com/Lookup/EMailCheck.cfm",
      type: "POST",
      dataType: "json",
      data: {
        AccountID: mmpFormOptions.account_ID,
        Email: $(this).val().trim(),
        IsActive: "Y", // Search for active subscriptions
      },
    })
      .done(function (data) {
        console.log(data);
        if (data == 1) {
          $emailDiv.show();
          $emailDiv.html(
            `This email is already associated with a membership. Please contact <a href="mailto:${$siteEmail}?subject=Duplicate%20Membership%20Email%20Address">${$siteEmail}</a> to change your membership type.`
          );
          $captchaSend.hide();
          console.log("EMail found");
        } else {
          $emailDiv.hide();
          console.log("EMail NOT found");
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        $emailDiv.html("Error checking email. Please try again.").show();
        console.error(
          "Email change AJAX request failed: " + textStatus,
          errorThrown
        );
      });
  });
  $("#fkclubtype").change(function () {
    console.log("Handler for membertype .change() called.");
    let mt = $(this).val();
    console.log(mt);
    switch (mt) {
      case "Rotary Club":
        $(".hide9").show();
        $("#fkmembertype").val("Active");
        break;
      case "Rotaract Club":
        $(".hide9").show();
        $("#fkmembertype").val("Rotaractor");
        break;
      case "Non-Rotarian":
        $(".hide9").hide();
        $("#fkmembertype").val("Non-Rotarian");
        break;
    }
  });

  $(".CountryLookup").on("select2:select", function (e) {
    let data = e.params.data;
    console.log(data);
    console.log("id=" + data.id); // countrycode
    console.log("country=" + data.text); // countryname
    console.log("cnt=" + data.cnt); // count of states
    $("#CountryCode").val(data.id); // countrycode
    if (data.cnt == 0) $("#staterow").hide();
    else $("#staterow").show();
  });

  $(".CountryLookup").select2({
    placeholder: "Select Country",
    ajax: {
      url: "https://www.emembersdb.com/Lookup/FKRotaryCountry.cfm",
      type: "POST",
      dataType: "json",
      quietMillis: 100,
      data: function (params) {
        var query = {
          term: params.term,
        };
        return query;
      },
    },
    results: function (data) {
      results = [];
      $.each(data, function (index, item) {
        results.push({
          id: item.id,
          text: item.text,
        });
      });
      return {
        results: results,
      };
    },
    createTag: function (params) {
      return {
        id: params.term,
        text: params.term,
        newOption: true,
      };
    },
  });

  $(".StateProvLookup").on("select2:select", function (e) {
    let data = e.params.data;
    console.log(data);
    console.log("id=" + data.id); // statecode
    console.log("StateProv=" + data.text); // StateProv
    $("#StateCode").val(data.statecode); // statecode
    $("#fkstateprov").val(data.text); // StateProv
    $("#ProvOrOther").val(data.province); // Province
  });

  $(".StateProvLookup").select2({
    placeholder: "Select State or Province",
    tags: true,
    ajax: {
      url: "https://www.emembersdb.com/Lookup/FKRotaryStateProv.cfm",
      // url: 'http://emdb.com/Lookup/FKRotaryStateProv.cfm',
      type: "POST",
      dataType: "json",
      quietMillis: 100,
      data: function (params) {
        var country = $("#fkcountry").val(); // countrycode
        console.log("country=" + country);
        if (country.length == 0) {
          alert("select Country first!");
          return "[]";
        }
        var query = {
          countrycode: country,
          AccountID: mmpFormOptions.account_ID,
          term: params.term,
        };
        return query;
      },
    },
    results: function (data) {
      results = [];
      $.each(data, function (index, item) {
        results.push({
          id: item.id,
          text: item.text,
        });
      });
      return {
        results: results,
      };
    },
    createTag: function (params) {
      return {
        id: params.term,
        text: params.term,
        newOption: true,
      };
    },
  });

  $(".ClubLookupInZone").on("select2:select", function (e) {
    console.log("ClubLookup change");
    let data = e.params.data;
    console.log(data);

    $("#fkdistrict").val(data.districtid); // DistrictID
    $("#zonename").val(data.zonename); // zonename
    $("#ClubID").val(data.id); // iMembersDB ClubID
    $("#fkclubname").val(data.text); // fkclubNmae
    $("#ClubLocDiv").html(
      "District: " + data.districtid + "   RAGAS zone: " + data.zonename
    );
  });

  $(".ClubLookupInZone").select2({
    placeholder: "Rotary Club",
    tags: true,
    ajax: {
      url: "https://www.emembersdb.com/Lookup/FKRotaryClubInZone.cfm",
      type: "POST",
      dataType: "json",
      quietMillis: 100,
      data: function (params) {
        let countrycode = $(".CountryLookup option:selected").val();
        let statecode = $("#StateCode").val();
        let orgtype = $("#fkclubtype").val();
        console.log(
          "countrycode=" +
            countrycode +
            " statecode=" +
            statecode +
            " orgtype=" +
            orgtype
        );
        let query = {
          AccountID: mmpFormOptions.account_ID,
          countrycode: countrycode,
          statecode: statecode,
          orgtype: orgtype,
          term: params.term,
        };
        return query;
      },
    },
    results: function (data) {
      results = [];
      $.each(data, function (index, item) {
        results.push({
          id: item.id,
          text: item.text,
        });
      });
      return {
        results: results,
      };
    },
    createTag: function (params) {
      return {
        id: params.id,
        text: params.text,
        newOption: true,
      };
    },
  });

  $("#prtapp").click(function () {
    console.log("print");
    $("#PrintContent").printThis();
    return false;
  });
});
