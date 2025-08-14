<?php

namespace App\Helpers;

class FileHelper
{
     public static function saveFile($file)
     {
        $data = file_get_contents($file);
        $image_info = getimagesize($file);
        $extension = '.'.(isset($image_info["mime"]) ? explode('/', $image_info["mime"] )[1]: "");

        $guid = bin2hex(openssl_random_pseudo_bytes(16));
        $dir = dirname(__DIR__, 2).'/storage/app/files/';
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        
        $name = $guid.$extension;
        file_put_contents($dir.$name, $data);
        return $name;
     }
}
?>