<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => '入力されたメールアドレスのユーザーが見つかりません。'], 404);
        }
        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token'      => Hash::make($token),
                'created_at' => Carbon::now(),
            ]
        );

        $resetLink = config('app.frontend_url') . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode($request->email);

        try {
            Mail::send('emails.reset-password', ['resetLink' => $resetLink], function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('パスワードリセットのご案内');
            });

            return response()->json([
                'message' => 'パスワードリセット用のリンクをメールに送信しました。',
                'status'  => 'success',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'メール送信に失敗しました。もう一度お試しください。',
                'status'  => 'error',
            ], 500);
        }
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $resetRecord) {
            return response()->json([
                'message' => '無効なパスワードリセットトークンです。',
                'errors'  => ['token' => ['無効なパスワードリセットトークンです。']],
            ], 400);
        }

        if (! Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => '無効なパスワードリセットトークンです。',
                'errors'  => ['token' => ['無効なパスワードリセットトークンです。']],
            ], 400);
        }

        if (Carbon::parse($resetRecord->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'パスワードリセットトークンの有効期限が切れています。',
                'errors'  => ['token' => ['パスワードリセットトークンの有効期限が切れています。']],
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'ユーザーが見つかりません。',
                'errors'  => ['email' => ['ユーザーが見つかりません。']],
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'パスワードを正常にリセットしました。',
            'status'  => 'success',
        ]);
    }
}
