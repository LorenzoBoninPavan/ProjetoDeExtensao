<?php
    function validarImagem($file) {
            $formato = ['image/jpeg', 'image/png', 'image/jpg']; //Formatos de imagens permitidos
            return isset($file['tmp_name']) && in_array($file['type'], $formato) && $file['size'] > 0; // Verifica se a imagem não está vazia
        }

        //Definição do diretório de imagens
        $uploadDir = 'uploads/'; //Define o caminho das imagens
        if (!is_dir($uploadDir)) { // Verifica se o diretório de imagem existe
            mkdir($uploadDir, 0777, true); // Cria a pasta se não existir
        }

        //Inicializa array para armazenar os caminhos das imagens
        $fotoPaths = [];

        //Validação das imagens
        foreach (['photo', 'photo2', 'photo3'] as $polaroid) { // Verifica as 3 fotos pedidas no formulário
            if (isset($_FILES[$polaroid]) && validarImagem($_FILES[$polaroid])) { // Verifica se a imagem foi enviada e é válida
                $ext = pathinfo($_FILES[$polaroid]['name'], PATHINFO_EXTENSION); //Pega a extensão do arquivo: png, jpg ou jpeg
                $filename = uniqid() . "." . $ext; // Cria um nome único para o arquivo 
                $destino = $uploadDir . $filename; // Vincula o nome do arquivo com o nome da pasta
                move_uploaded_file($_FILES[$polaroid]['tmp_name'], $destino); // Move o arquivo para o diretório uploads
                $fotoPaths[$polaroid] = $destino; // Salva o caminho da imagem na variável $fotoPaths, com o novo nome atribuído
            } else {
                $fotoPaths[$polaroid] = null; // Caso a imagem não seja válida ou não enviada, armazena null
            }
        }
?>