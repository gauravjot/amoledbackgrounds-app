package com.gauravjot.androidimageview

import android.content.Context
import android.widget.ImageView;
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class ImageView(context: Context, appContext: AppContext) : ExpoView(context, appContext){
  internal val imageView = ImageView(context).also {
    it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    it.setBackgroundColor(0xFF000000.toInt())
    addView(it)
  }
}
