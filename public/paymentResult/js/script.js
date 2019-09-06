$(function() {
  var checkStatus = function() {
    $.ajax({
      url: "/billing/liqpay/status?orderId=" + order.id
    }).done(function(data) {
      $( '#status' ).text( data.text);
      if (data.status === 'failure') {
        $('#status').css('color', 'red');
      }
      if (data.status === 'success' || data.status === 'failure') {
        $('#check_status_indicator').hide();
        setTimeout(function() {
          location.href = '/app#!/settings/profile';
        }, 3000);
      }
    });
  };
  checkStatus();
  setInterval(function() {
    checkStatus();
  }, 5000);
});