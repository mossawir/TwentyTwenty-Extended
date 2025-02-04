(function($){

  $.fn.twentytwenty = function(options) {
    // If the first argument is 'destroy', call the destroy method
    if (options === 'destroy') {
      return this.each(function() {
        destroyTwentyTwenty($(this));
      });
    }

    // Default options
    var options = $.extend({
      default_offset_pct: 0.5,
      orientation: 'horizontal',
      before_label: 'Before',
      after_label: 'After',
      no_overlay: false,
      move_slider_on_hover: false,
      move_with_handle_only: true,
      click_to_move: false
    }, options);

    return this.each(function() {
      // Store the options in the container's data for later use
      $(this).data('twentytwenty-options', options);
      initializeTwentyTwenty($(this), options);
    });
  };

  function initializeTwentyTwenty(container, options) {
    var sliderPct = options.default_offset_pct;
    var sliderOrientation = options.orientation;
    var beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
    var afterDirection = (sliderOrientation === 'vertical') ? 'up' : 'right';

    container.wrap("<div class='twentytwenty-wrapper twentytwenty-" + sliderOrientation + "'></div>");
    if(!options.no_overlay) {
      container.append("<div class='twentytwenty-overlay'></div>");
      var overlay = container.find(".twentytwenty-overlay");
      overlay.append("<div class='twentytwenty-before-label' data-content='"+options.before_label+"'></div>");
      overlay.append("<div class='twentytwenty-after-label' data-content='"+options.after_label+"'></div>");
    }
    var beforeImg = container.find("img:first");
    var afterImg = container.find("img:last");
    container.append("<div class='twentytwenty-handle'></div>");
    var slider = container.find(".twentytwenty-handle");
    slider.append("<span class='twentytwenty-" + beforeDirection + "-arrow'></span>");
    slider.append("<span class='twentytwenty-" + afterDirection + "-arrow'></span>");
    container.addClass("twentytwenty-container");
    beforeImg.addClass("twentytwenty-before");
    afterImg.addClass("twentytwenty-after");

    var calcOffset = function(dimensionPct) {
      var w = beforeImg.width();
      var h = beforeImg.height();
      return {
        w: w+"px",
        h: h+"px",
        cw: (dimensionPct*w)+"px",
        ch: (dimensionPct*h)+"px"
      };
    };

    var adjustContainer = function(offset) {
      if (sliderOrientation === 'vertical') {
        beforeImg.css("clip", "rect(0,"+offset.w+","+offset.ch+",0)");
        afterImg.css("clip", "rect("+offset.ch+","+offset.w+","+offset.h+",0)");
      }
      else {
        beforeImg.css("clip", "rect(0,"+offset.cw+","+offset.h+",0)");
        afterImg.css("clip", "rect(0,"+offset.w+","+offset.h+","+offset.cw+")");
      }
      container.css("height", offset.h);
    };

    var adjustSlider = function(pct) {
      var offset = calcOffset(pct);
      slider.css((sliderOrientation==="vertical") ? "top" : "left", (sliderOrientation==="vertical") ? offset.ch : offset.cw);
      adjustContainer(offset);
    };

    var minMaxNumber = function(num, min, max) {
      return Math.max(min, Math.min(max, num));
    };

    var getSliderPercentage = function(positionX, positionY) {
      var sliderPercentage = (sliderOrientation === 'vertical') ?
        (positionY-offsetY)/imgHeight :
        (positionX-offsetX)/imgWidth;

      return minMaxNumber(sliderPercentage, 0, 1);
    };

    $(window).on("resize.twentytwenty", function(e) {
      adjustSlider(sliderPct);
    });

    var offsetX = 0;
    var offsetY = 0;
    var imgWidth = 0;
    var imgHeight = 0;
    var onMoveStart = function(e) {
      if (((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) && sliderOrientation !== 'vertical') {
        e.preventDefault();
      }
      else if (((e.distX < e.distY && e.distX < -e.distY) || (e.distX > e.distY && e.distX > -e.distY)) && sliderOrientation === 'vertical') {
        e.preventDefault();
      }
      container.addClass("active");
      offsetX = container.offset().left;
      offsetY = container.offset().top;
      imgWidth = beforeImg.width(); 
      imgHeight = beforeImg.height();          
    };
    var onMove = function(e) {
      if (container.hasClass("active")) {
        sliderPct = getSliderPercentage(e.pageX, e.pageY);
        adjustSlider(sliderPct);
      }
    };
    var onMoveEnd = function() {
        container.removeClass("active");
    };

    var moveTarget = options.move_with_handle_only ? slider : container;
    moveTarget.on("movestart",onMoveStart);
    moveTarget.on("move",onMove);
    moveTarget.on("moveend",onMoveEnd);

    if (options.move_slider_on_hover) {
      container.on("mouseenter", onMoveStart);
      container.on("mousemove", onMove);
      container.on("mouseleave", onMoveEnd);
    }

    slider.on("touchmove", function(e) {
      e.preventDefault();
    });

    container.find("img").on("mousedown", function(event) {
      event.preventDefault();
    });

    if (options.click_to_move) {
      container.on('click', function(e) {
        offsetX = container.offset().left;
        offsetY = container.offset().top;
        imgWidth = beforeImg.width();
        imgHeight = beforeImg.height();

        sliderPct = getSliderPercentage(e.pageX, e.pageY);
        adjustSlider(sliderPct);
      });
    }

    $(window).trigger("resize.twentytwenty");
  }

  function destroyTwentyTwenty(container) {
    // Remove all event listeners
    container.off("movestart");
    container.off("move");
    container.off("moveend");
    container.off("mouseenter");
    container.off("mousemove");
    container.off("mouseleave");
    container.off("click");
    container.find("img").off("mousedown");
    $(window).off("resize.twentytwenty");

    // Remove added elements
    container.find(".twentytwenty-handle").remove();
    container.find(".twentytwenty-overlay").remove();
    container.unwrap();
    container.removeClass("twentytwenty-container");
    container.find("img").removeClass("twentytwenty-before twentytwenty-after");

    // Retrieve the stored options
    var options = container.data('twentytwenty-options');

    // Reinitialize the plugin with the stored options
    initializeTwentyTwenty(container, options);
  }

})(jQuery);