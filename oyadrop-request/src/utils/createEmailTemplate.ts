export const createEmailTemplate = (data: any) => /* HTML */ `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Delivery Request</title>
    </head>
    <body
      style="font-family: Arial, sans-serif; line-height: 1.6; color: hsl(240, 10%, 3.9%); margin: 0; padding: 0; background-color: hsl(0, 0%, 100%);"
    >
      <div
        style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
      >
        <div
          style="background: linear-gradient(to left, transparent 0%, hsl(160, 84%, 40%) 50%, hsl(160, 84%, 32%) 100%); padding: 20px; border-radius: 8px 8px 0 0;"
        >
          <h2 style="margin: 0; color: hsl(0, 0%, 98%); font-size: 24px;">
            New Delivery Request
          </h2>
          <p style="margin: 5px 0 0; color: hsl(0, 0%, 98%); opacity: 0.9;">
            ${new Date().toLocaleString()}
          </p>
        </div>

        <div
          style="padding: 20px; border-bottom: 1px solid hsl(240, 4.8%, 95.9%);"
        >
          <h3
            style="margin: 0 0 15px; color: hsl(160, 84%, 39%); font-size: 18px;"
          >
            📍 Pickup Details
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td
                style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%); width: 120px;"
              >
                Name:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.pickupName}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Phone:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.pickupPhone}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Email:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.pickupEmail}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Address:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.pickupAddress}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Time:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.pickupDateTime
                    ? new Date(data.pickupDateTime).toLocaleString()
                    : "Not specified"}</strong
                >
              </td>
            </tr>
          </table>
        </div>

        <div
          style="padding: 20px; border-bottom: 1px solid hsl(240, 4.8%, 95.9%);"
        >
          <h3
            style="margin: 0 0 15px; color: hsl(160, 84%, 39%); font-size: 18px;"
          >
            📦 Primary Dropoff
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td
                style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%); width: 120px;"
              >
                Name:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.dropoffName}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Phone:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.dropoffPhone}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Address:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.dropoffAddress}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Quantity:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.itemQuantity}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Description:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.itemDescription}</strong
                >
              </td>
            </tr>
          </table>
          ${data.itemImage
            ? `
          <div style="margin-top: 15px;">
            <img src="${data.itemImage}" alt="Item Image" style="max-width: 200px; border-radius: 4px; border: 1px solid hsl(240, 4.8%, 95.9%);">
          </div>
          `
            : ""}
        </div>

        ${data.additionalDropoffs?.length
          ? `
        <div style="padding: 20px; border-bottom: 1px solid hsl(240, 4.8%, 95.9%);">
          <h3 style="margin: 0 0 15px; color: hsl(160, 84%, 39%); font-size: 18px;">📦 Additional Dropoffs</h3>
          ${data.additionalDropoffs
            .map(
              (dropoff: any, index: number) => `
          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed hsl(240, 4.8%, 95.9%);">
            <h4 style="margin: 0 0 10px; color: hsl(240, 10%, 3.9%);">Dropoff #${
              index + 1
            }</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%); width: 120px;">Name:</td>
                <td style="padding: 8px 0;"><strong style="color: hsl(240, 10%, 3.9%);">${
                  dropoff.name
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">Phone:</td>
                <td style="padding: 8px 0;"><strong style="color: hsl(240, 10%, 3.9%);">${
                  dropoff.phone
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">Address:</td>
                <td style="padding: 8px 0;"><strong style="color: hsl(240, 10%, 3.9%);">${
                  dropoff.address
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">Quantity:</td>
                <td style="padding: 8px 0;"><strong style="color: hsl(240, 10%, 3.9%);">${
                  dropoff.itemQuantity
                }</strong></td>
              </tr>
            </table>
            ${
              dropoff.itemImage
                ? `
            <div style="margin-top: 15px;">
              <img src="${dropoff.itemImage}" alt="Additional Item Image ${
                    index + 1
                  }" style="max-width: 200px; border-radius: 4px; border: 1px solid hsl(240, 4.8%, 95.9%);">
            </div>
            `
                : ""
            }
          </div>
          `
            )
            .join("")}
        </div>
        `
          : ""}

        <div
          style="padding: 20px; background-color: hsl(240, 4.8%, 95.9%); border-radius: 0 0 8px 8px;"
        >
          <h3
            style="margin: 0 0 15px; color: hsl(160, 84%, 39%); font-size: 18px;"
          >
            💰 Payment Details
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td
                style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%); width: 120px;"
              >
                Amount:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(160, 84%, 39%); font-size: 18px;"
                  >₦${data.estimatedPrice?.toLocaleString()}</strong
                >
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">
                Method:
              </td>
              <td style="padding: 8px 0;">
                <strong style="color: hsl(240, 10%, 3.9%);"
                  >${data.paymentMethod === "pay_now"
                    ? "Paid Online"
                    : "Pay After Delivery"}</strong
                >
              </td>
            </tr>
            ${data.paymentReference
              ? `
            <tr>
              <td style="padding: 8px 0; color: hsl(240, 3.8%, 46.1%);">Reference:</td>
              <td style="padding: 8px 0;"><strong style="color: hsl(240, 10%, 3.9%);">${data.paymentReference}</strong></td>
            </tr>
            `
              : ""}
          </table>
        </div>
      </div>
    </body>
  </html>
`;
