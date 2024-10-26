package com.gauravjot.androidimageview

import android.content.Context
import android.widget.ImageView;
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class NativeImageView(context: Context, appContext: AppContext) : ExpoView(context, appContext){
  internal val imageView = ImageView(context).also {
    it.layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
    it.scaleType = ImageView.ScaleType.CENTER_CROP
    addView(it)

    it.setBackgroundColor(0xFFFF0000.toInt())
  }
}
