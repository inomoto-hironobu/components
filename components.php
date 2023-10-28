<?php
/*
Plugin Name: 八百幡コンポーネンツ
Description: 八百幡コンポーネンツの利用を可能にする
Version: 0.1
Author: 井本拓伸
Author URI: https://yaohata.net
*/

// プラグインの設定を追加する
add_action('admin_menu', 'yaohata_components_menu_page');
function yaohata_components_menu_page() {
    add_menu_page(
        '八百幡コンポーネンツ',
        '八百幡コンポーネンツ',
        'manage_options',
        'yaohata_components_menu',
        'add_custom_menu_page',
        'dashicons-admin-generic',
        99
    );
    
}
function add_custom_menu_page() {
    
}

add_action('wp_head', 'yaohata_components_head');
function yaohata_components_head() {
    echo '<script src="'.plugin_dir_url (__FILE__).'lib/SaxonJS2.js"></script>'."\n";
    echo '<script src="'.plugin_dir_url (__FILE__).'lib/d3.js"></script>'."\n";
    echo '<script src="'.plugin_dir_url (__FILE__).'js/basic.js"></script>'."\n";
    echo '<script src="'.plugin_dir_url (__FILE__).'js/template.js"></script>'."\n";
    echo '<script src="'.plugin_dir_url (__FILE__).'js/visualization.js"></script>'."\n";
    echo '<link rel="yaohata-components-path" href="'.plugin_dir_url(__FILE__).'"/>'."\n";
}