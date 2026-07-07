<?php

namespace App\Helpers;

class FileHelper
{
     public static function saveFile($file)
     {
        $data = null;
        $extension = '';

        if (is_string($file) && preg_match('/^data:(image\/[^;]+);base64,(.*)$/', $file, $matches)) {
            $mime = $matches[1];
            $data = base64_decode($matches[2]);
            $extension = '.' . explode('/', $mime)[1];
        } elseif (is_object($file) && method_exists($file, 'getRealPath')) {
            $path = $file->getRealPath();
            $data = file_get_contents($path);
            $image_info = getimagesize($path);
            $extension = '.' . (isset($image_info["mime"]) ? explode('/', $image_info["mime"])[1] : $file->getClientOriginalExtension());
        } else {
            $data = file_get_contents($file);
            $image_info = getimagesize($file);
            $extension = '.' . (isset($image_info["mime"]) ? explode('/', $image_info["mime"])[1] : "");
        }

        if ($data === false) {
            throw new \Exception('Unable to read image data');
        }

        if (empty($extension)) {
            $extension = '.png';
        }

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