<?php

if (!function_exists('onepress_sanitize_map_embed')) {
  /**
   * Sanitize front-end map embed markup (e.g. Google Maps iframe from Share → Embed).
   *
   * @param string $value Raw HTML from the Customizer.
   * @return string
   */
  function onepress_sanitize_map_embed($value)
  {
    if (! is_string($value)) {
      return '';
    }
    $value = trim($value);
    if ('' === $value) {
      return '';
    }
    $allowed = array(
      'iframe' => array(
        'align'           => true,
        'allow'           => true,
        'allowfullscreen' => true,
        'class'           => true,
        'frameborder'     => true,
        'height'          => true,
        'id'              => true,
        'loading'         => true,
        'name'            => true,
        'referrerpolicy'  => true,
        'sandbox'         => true,
        'scrolling'       => true,
        'src'             => true,
        'style'           => true,
        'title'           => true,
        'width'           => true,
      ),
    );

    return wp_kses($value, $allowed);
  }
}
