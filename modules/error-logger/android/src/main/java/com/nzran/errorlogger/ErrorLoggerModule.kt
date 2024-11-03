package com.nzran.errorlogger

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ErrorLoggerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ErrorLogger")

    AsyncFunction("logError") { error: String ->
      // Log the error.
      println(error)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ErrorLoggerView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: ErrorLoggerView, prop: String ->
        println(prop)
      }
    }
  }

  companion object {
    private const val ENDPOINT = "https://example.com/bulk"
  }
}
