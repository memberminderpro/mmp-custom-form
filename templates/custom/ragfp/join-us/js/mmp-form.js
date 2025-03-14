jQuery(document).ready(function($) {
    function verifyCaptchaAndSubmitForm(captchaData) {
        $.ajax({
            url: "/wp-admin/admin-ajax.php",
            type: "POST",
            data: Object.assign({
                action: "verify_and_submit_captcha",
            }, captchaData),
            success: function(response) {
                if (response.success) {
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
                    let formData = $joinForm.serialize();
                    console.log(formData);
                    //debugger ;
                    $("#messageContainer").html("<h4>Thank You!</h4><p>You will now be redirected to our payment gateway in a new window to complete the process. You may safely navigate away from this page or close this tab.</p>");
                    $joinForm.attr("target", "_blank").hide().submit()
                } else {
                    alert("Captcha verification failed. Please try again.")
                }
            },
            error: function(xhr, status, error) {
                alert("An error occurred: " + error)
            },
        })
    }
    $("#Email").change(function() {
        console.log("Handler for email .change() called.");
        $.ajax({
            url: "https://www.emembersdb.com/Lookup/EMailCheck.cfm",
            type: "POST",
            dataType: "json",
            data: {
                AccountID: mmpFormOptions.account_ID,
                Email: $(this).val().trim(),
                IsActive: "Y",
            },
        }).done(function(data) {
            console.log(data);
            if (data == 1) {
                $emailDiv.show();
                $emailDiv.html(`This email is already associated with a membership. Please contact <a href="mailto:${$siteEmail}?subject=Duplicate%20Membership%20Email%20Address">${$siteEmail}</a> to change your membership type.`);
                $captchaSend.hide();
                console.log("EMail found")
            } else {
                $emailDiv.hide();
                console.log("EMail NOT found")
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            $emailDiv.html("Error checking email. Please try again.").show();
            console.error("Email change AJAX request failed: " + textStatus, errorThrown)
        })
    });
    $("#fkclubtype").change(function() {
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
            break
        }
    });
    $(".CountryLookup").on("select2:select", function(e) {
        let data = e.params.data;
        console.log(data);
        console.log("id=" + data.id);
        console.log("country=" + data.text);
        console.log("cnt=" + data.cnt);
        $("#CountryCode").val(data.id);
        if (data.cnt == 0)
            $("#staterow").hide();
        else
            $("#staterow").show()
    });
    $(".CountryLookup").select2({
        placeholder: "Select Country",
        ajax: {
            url: "https://www.emembersdb.com/Lookup/FKRotaryCountry.cfm",
            type: "POST",
            dataType: "json",
            quietMillis: 100,
            data: function(params) {
                var query = {
                    term: params.term,
                };
                return query
            },
        },
        results: function(data) {
            results = [];
            $.each(data, function(index, item) {
                results.push({
                    id: item.id,
                    text: item.text,
                })
            });
            return {
                results: results,
            }
        },
        createTag: function(params) {
            return {
                id: params.term,
                text: params.term,
                newOption: !0,
            }
        },
    });
    $(".StateProvLookup").on("select2:select", function(e) {
        let data = e.params.data;
        console.log(data);
        console.log("id=" + data.id);
        console.log("StateProv=" + data.text);
        $("#StateCode").val(data.statecode);
        $("#fkstateprov").val(data.text);
        $("#ProvOrOther").val(data.province)
    });
    $(".StateProvLookup").select2({
        placeholder: "Select State or Province",
        tags: !0,
        ajax: {
            url: "https://www.emembersdb.com/Lookup/FKRotaryStateProv.cfm",
            type: "POST",
            dataType: "json",
            quietMillis: 100,
            data: function(params) {
                var country = $("#fkcountry").val();
                console.log("country=" + country);
                if (country.length == 0) {
                    alert("select Country first!");
                    return "[]"
                }
                var query = {
                    countrycode: country,
                    AccountID: mmpFormOptions.account_ID,
                    term: params.term,
                };
                return query
            },
        },
        results: function(data) {
            results = [];
            $.each(data, function(index, item) {
                results.push({
                    id: item.id,
                    text: item.text,
                })
            });
            return {
                results: results,
            }
        },
        createTag: function(params) {
            return {
                id: params.term,
                text: params.term,
                newOption: !0,
            }
        },
    });
    $(".ClubLookupInZone").on("select2:select", function(e) {
        console.log("ClubLookup change");
        let data = e.params.data;
        console.log(data);
        $("#fkdistrict").val(data.districtid);
        $("#zonename").val(data.zonename);
        $("#ClubID").val(data.id);
        $("#fkclubname").val(data.text);
        $("#ClubLocDiv").html("District: " + data.districtid + "   RAGAS zone: " + data.zonename)
    });
    $(".ClubLookupInZone").select2({
        placeholder: "Rotary Club",
        tags: !0,
        ajax: {
            url: "https://www.emembersdb.com/Lookup/FKRotaryClubInZone.cfm",
            type: "POST",
            dataType: "json",
            quietMillis: 100,
            data: function(params) {
                let countrycode = $(".CountryLookup option:selected").val();
                let statecode = $("#StateCode").val();
                let orgtype = $("#fkclubtype").val();
                console.log("countrycode=" + countrycode + " statecode=" + statecode + " orgtype=" + orgtype);
                let query = {
                    AccountID: mmpFormOptions.account_ID,
                    countrycode: countrycode,
                    statecode: statecode,
                    orgtype: orgtype,
                    term: params.term,
                };
                return query
            },
        },
        results: function(data) {
            results = [];
            $.each(data, function(index, item) {
                results.push({
                    id: item.id,
                    text: item.text,
                })
            });
            return {
                results: results,
            }
        },
        createTag: function(params) {
            return {
                id: params.id,
                text: params.text,
                newOption: !0,
            }
        },
    });
    $("#prtapp").click(function() {
        console.log("print");
        $("#PrintContent").printThis();
        return !1
    })
})
