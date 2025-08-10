
import AdminProtectedWrapper from "@/features/home/components/AdminWrapper"
import FormCreate from "@/features/home/components/FormCreateProduct"
import React from "react"

const PageForm = () => {
  return (
    <div>
      <AdminProtectedWrapper>
        <FormCreate />
      </AdminProtectedWrapper>
    </div>
  )
}

export default PageForm
