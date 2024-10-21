package com.droidheat.amoledbackgrounds;

import android.Manifest;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.app.WallpaperManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.database.Cursor;
import android.content.ContentUris;
import android.os.ParcelFileDescriptor;
import androidx.core.content.ContextCompat;
import android.provider.MediaStore;
import android.util.Log;

import java.io.IOException;

public class AppUtils {

	public Boolean changeWallpaper(Context context, String pathOfNewWallpaper) {
    // Check if the app has permission to read external storage
		if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE)
						!= PackageManager.PERMISSION_GRANTED) {
			Log.d("Permission error", "Read permission is not granted");
		} else {
			Log.d("Permission", "Read permission is granted");
		}
    // Change the wallpaper
		WallpaperManager wallpaperManager = WallpaperManager.getInstance(context);
		Bitmap bitmap = getBitmap(context, pathOfNewWallpaper);
		if (bitmap != null) {
			try {
				wallpaperManager.setBitmap(bitmap);
				return true;
			} catch (IOException e) {
        Log.d("error", "error setting wallpaper " + e.getMessage());
			}
		} else {
			Log.d("error", "bitmap is null " + pathOfNewWallpaper);
		}
		return false;
	}

  private Bitmap getBitmap(Context context, String pathOfNewWallpaper) {

		if (Build.VERSION.SDK_INT >= 29) {
			String[] projection = new String[]{
							MediaStore.Images.Media._ID,
							MediaStore.Images.Media.DISPLAY_NAME,
							MediaStore.Images.Media.RELATIVE_PATH
			};
			String selection = MediaStore.Images.Media.DISPLAY_NAME + " == ?";
			String[] selectionArgs = new String[]{
							pathOfNewWallpaper.substring(pathOfNewWallpaper.lastIndexOf("/")).replace("/", "")
											.trim()
			};
			try {
				final Cursor cursor = context.getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
								projection, selection, selectionArgs, MediaStore.Images.ImageColumns.DATE_MODIFIED + " DESC");
				if (cursor != null && cursor.moveToFirst()) {
					// You can replace '0' by 'cursor.getColumnIndex(MediaStore.Images.ImageColumns._ID)'
					// Note that now, you read the column '_ID' and not the column 'DATA'
					Uri imageUri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cursor.getInt(0));

					// now that you have the media URI, you can decode it to a bitmap
					try (ParcelFileDescriptor pfd = context.getContentResolver().openFileDescriptor(imageUri, "r")) {
						if (pfd != null) {
							return BitmapFactory.decodeFileDescriptor(pfd.getFileDescriptor());
						}
					} catch (IOException ex) {
						return null;
					}
					cursor.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		} else {
			BitmapFactory.Options options = new BitmapFactory.Options();
			options.inPreferredConfig = Bitmap.Config.ARGB_8888;
			return BitmapFactory.decodeFile(pathOfNewWallpaper, options);
		}
		return null;
	}

}