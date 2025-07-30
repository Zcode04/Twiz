import React from "react"
import { FileSpreadsheetIcon } from "lucide-react"

const FileSpreadsheet = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>(({ className, ...props }, ref) => (
  <FileSpreadsheetIcon ref={ref} className={className} {...props} />
))
FileSpreadsheet.displayName = "FileSpreadsheet"

export default FileSpreadsheet
