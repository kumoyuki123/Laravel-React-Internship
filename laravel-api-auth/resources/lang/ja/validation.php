<?php

return [
    // Common validation messages
    'required' => ':attributeを入力してください。',
    'string' => ':attributeは文字で入力してください。',
    'email' => ':attributeは有効なメールアドレス形式で入力してください。',
    'max' => [
        'string' => ':attributeは:max文字以内で入力してください。',
        'numeric' => ':attributeは:max以下で入力してください。',
        'array' => ':attributeは:max個以下で選択してください。',
        'file' => ':attributeは:maxKB以下のファイルを選択してください。',
    ],
    'min' => [
        'string' => ':attributeは:min文字以上で入力してください。',
        'numeric' => ':attributeは:min以上で入力してください。',
        'array' => ':attributeは:min個以上で選択してください。',
        'file' => ':attributeは:minKB以上のファイルを選択してください。',
    ],
    'unique' => 'この:attributeは既に登録されています。',
    'confirmed' => ':attribute確認が一致しません。',
    'numeric' => ':attributeは数値で入力してください。',
    'integer' => ':attributeは整数で入力してください。',
    'boolean' => ':attributeは真偽値で入力してください。',
    'date' => ':attributeは有効な日付形式で入力してください。',
    'url' => ':attributeは有効なURL形式で入力してください。',
    'image' => ':attributeは画像ファイルでなければなりません。',
    'file' => ':attributeはファイルでなければなりません。',
    'mimes' => ':attributeは:values形式のファイルでなければなりません。',
    'exists' => '選択された:attributeは無効です。',
    'regex' => ':attributeの形式が正しくありません。',
    'same' => ':attributeと:otherが一致しません。',
    'size' => [
        'string' => ':attributeは:size文字で入力してください。',
        'numeric' => ':attributeは:sizeで入力してください。',
        'array' => ':attributeは:size個で選択してください。',
        'file' => ':attributeは:sizeKBのファイルを選択してください。',
    ],

    // Custom attribute names (Japanese translations)
    'attributes' => [
        'name' => '名前',
        'email' => 'メールアドレス',
        'password' => 'パスワード',
        'confirm_password' => 'パスワード確認',
        'phone' => '電話番号',
        'address' => '住所',
        'birth_date' => '生年月日',
        'age' => '年齢',
        'status' => 'ステータス',
        'description' => '説明',
        'image' => '画像',
        'file' => 'ファイル',
        'url' => 'URL',
        'role' => '役割',
        'permissions' => '権限',

        // Student attributes
        'roll_no' => '学籍番号',
        'nrc_no' => 'NRC番号',
        'major' => '専攻',
        'year' => '学年',
        'iq_score' => 'IQスコア',
        
        // School attributes
        'teacher_name' => '教師名',
        'teacher_email' => '教師メールアドレス',
        
        // Attendance attributes
        'date' => '日付',
        'status' => 'ステータス',
        'check_in_time' => 'チェックイン時間',
        'start_date' => '開始日',
        'end_date' => '終了日',
    ],
];