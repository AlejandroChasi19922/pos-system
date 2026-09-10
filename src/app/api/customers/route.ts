import { NextResponse } from "next/server";
import { CustomerRepository } from "@/repositories/CustomerRepository";
import { EcuadoreanIdentityValidator } from "@/services/EcuadoreanIdentityValidator";

const customerRepo = new CustomerRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const result = await customerRepo.searchCustomers(query, page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dniTaxId, firstName, lastName, email, phone, address } = body;

    // Requirement #6: Field validations
    if (!EcuadoreanIdentityValidator.validateCedula(dniTaxId)) {
      return NextResponse.json(
        { error: "La cédula o RUC ingresado no es válido para Ecuador." },
        { status: 400 }
      );
    }

    if (!EcuadoreanIdentityValidator.validateOnlyLetters(firstName)) {
      return NextResponse.json(
        { error: "El nombre debe contener únicamente letras." },
        { status: 400 }
      );
    }

    if (!EcuadoreanIdentityValidator.validateOnlyLetters(lastName)) {
      return NextResponse.json(
        { error: "El apellido debe contener únicamente letras." },
        { status: 400 }
      );
    }

    if (!EcuadoreanIdentityValidator.validateEmail(email)) {
      return NextResponse.json(
        { error: "El formato de correo electrónico no es válido." },
        { status: 400 }
      );
    }

    const newCustomer = await customerRepo.createCustomer({
      dniTaxId: dniTaxId.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: 400 }
    );
  }
}
