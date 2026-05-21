$(document).ready(function () {
  $("#carousel").unitegallery({
    gallery_width: "100%",
    gallery_min_width: "100%",
    gallery_height: 600,
    gallery_min_height: 600,
    gallery_theme: "default",
    slider_scale_mode: "fit",
    slider_transition: "fade",
    slider_transition_speed: 1500,
    gallery_autoplay: true,
    gallery_play_interval: 6000,
    thumb_image_overlay_effect: true,
    slider_progress_indicator_type: "pie2",
    slider_enable_fullscreen_button: false,
    slider_control_zoom: false,
    slider_enable_zoom_panel: false
  });
  $("#thumbnail-container").unitegallery({
    gallery_width: 900,
    gallery_min_width: "80%",
    gallery_theme: "tiles",
    lightbox_type: "compact"
  });

  $(".client-experience-trigger").on("click", function () {
    $.featherlight($("#client-experience"), {});
  });

  $(".working-guideline-trigger").on("click", function () {
    $.featherlight($("#working-guideline"), {});
  });
});